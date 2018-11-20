package main

import (
	"bytes"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sync"
	"text/template"
	"time"

	"gopkg.in/yaml.v2"
)

// Current schema version. We compare it with the value from
// the configuration file and perform necessary upgrade operations if needed
const SchemaVersion = 1

// Directory where we'll store all downloaded filters contents
const FiltersDir = "filters"

// User filter ID is always 0
const UserFilterId = 0

// Just a counter that we use for incrementing the filter ID
var NextFilterId = time.Now().Unix()

// configuration is loaded from YAML
type configuration struct {
	// Config filename (can be overriden via the command line arguments)
	ourConfigFilename string
	// Basically, this is our working directory
	ourBinaryDir string
	// Directory to store data (i.e. filters contents)
	ourDataDir string

	// Schema version of the config file. This value is used when performing the app updates.
	SchemaVersion int           `yaml:"schema_version"`
	BindHost      string        `yaml:"bind_host"`
	BindPort      int           `yaml:"bind_port"`
	AuthName      string        `yaml:"auth_name"`
	AuthPass      string        `yaml:"auth_pass"`
	CoreDNS       coreDNSConfig `yaml:"coredns"`
	Filters       []filter      `yaml:"filters"`
	UserRules     []string      `yaml:"user_rules"`

	sync.RWMutex `yaml:"-"`
}

type coreDnsFilter struct {
	ID   int64  `yaml:"-"`
	Path string `yaml:"-"`
}

type coreDNSConfig struct {
	binaryFile          string
	coreFile            string
	Filters             []coreDnsFilter `yaml:"-"`
	Port                int             `yaml:"port"`
	ProtectionEnabled   bool            `yaml:"protection_enabled"`
	FilteringEnabled    bool            `yaml:"filtering_enabled"`
	SafeBrowsingEnabled bool            `yaml:"safebrowsing_enabled"`
	SafeSearchEnabled   bool            `yaml:"safesearch_enabled"`
	ParentalEnabled     bool            `yaml:"parental_enabled"`
	ParentalSensitivity int             `yaml:"parental_sensitivity"`
	BlockedResponseTTL  int             `yaml:"blocked_response_ttl"`
	QueryLogEnabled     bool            `yaml:"querylog_enabled"`
	Pprof               string          `yaml:"-"`
	Cache               string          `yaml:"-"`
	Prometheus          string          `yaml:"-"`
	BootstrapDNS        string          `yaml:"bootstrap_dns"`
	UpstreamDNS         []string        `yaml:"upstream_dns"`
	Bind                string          `yaml:"bind"`
}

type filter struct {
	ID          int64  `json:"id" yaml:"id"` // auto-assigned when filter is added (see NextFilterId)
	URL         string `json:"url"`
	Name        string `json:"name" yaml:"name"`
	Enabled     bool   `json:"enabled"`
	RulesCount  int    `json:"rulesCount" yaml:"-"`
	contents    []byte
	LastUpdated time.Time `json:"lastUpdated" yaml:"last_updated"`
}

var defaultDNS = []string{"tls://8.8.8.8"}

// initialize to default values, will be changed later when reading config or parsing command line
var config = configuration{
	ourConfigFilename: "whitehat.yaml",
	ourDataDir:        "data",
	BindPort:          80,
	BindHost:          "185.220.184.184",
	CoreDNS: coreDNSConfig{
		Port:                53,
		binaryFile:          "coredns",  // only filename, no path
		coreFile:            "Corefile", // only filename, no path
		ProtectionEnabled:   true,
		FilteringEnabled:    true,
		SafeBrowsingEnabled: true,
		BlockedResponseTTL:  10, // in seconds
		QueryLogEnabled:     true,
		BootstrapDNS:        "8.8.8.8:53",
		UpstreamDNS:         defaultDNS,
		Cache:               "cache",
		Prometheus:          "prometheus :9153",
		Bind:                "185.220.184.184",
	},
	Filters: []filter{
		{ID: 1, Enabled: true, URL: "https://whitehat.ro/~zmeu/whs/filter.txt", Name: "WhiteHat Simplified Domain Names filter"},
	},
}

// Creates a helper object for working with the user rules
func getUserFilter() filter {

	// TODO: This should be calculated when UserRules are set
	var contents []byte
	for _, rule := range config.UserRules {
		contents = append(contents, []byte(rule)...)
		contents = append(contents, '\n')
	}

	userFilter := filter{
		// User filter always has constant ID=0
		ID:       UserFilterId,
		contents: contents,
		Enabled:  true,
	}

	return userFilter
}

// Loads configuration from the YAML file
func parseConfig() error {
	configFile := filepath.Join(config.ourBinaryDir, config.ourConfigFilename)
	log.Printf("Reading YAML file: %s", configFile)
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		// do nothing, file doesn't exist
		log.Printf("YAML file doesn't exist, skipping: %s", configFile)
		return nil
	}
	yamlFile, err := ioutil.ReadFile(configFile)
	if err != nil {
		log.Printf("Couldn't read config file: %s", err)
		return err
	}
	err = yaml.Unmarshal(yamlFile, &config)
	if err != nil {
		log.Printf("Couldn't parse config file: %s", err)
		return err
	}

	// Deduplicate filters
	{
		i := 0 // output index, used for deletion later
		urls := map[string]bool{}
		for _, filter := range config.Filters {
			if _, ok := urls[filter.URL]; !ok {
				// we didn't see it before, keep it
				urls[filter.URL] = true // remember the URL
				config.Filters[i] = filter
				i++
			}
		}
		// all entries we want to keep are at front, delete the rest
		config.Filters = config.Filters[:i]
	}

	// Set the next filter ID to max(filter.ID) + 1
	for i := range config.Filters {
		if NextFilterId < config.Filters[i].ID {
			NextFilterId = config.Filters[i].ID + 1
		}
	}

	return nil
}

// Saves configuration to the YAML file and also saves the user filter contents to a file
func writeConfig() error {
	configFile := filepath.Join(config.ourBinaryDir, config.ourConfigFilename)
	log.Printf("Writing YAML file: %s", configFile)
	yamlText, err := yaml.Marshal(&config)
	if err != nil {
		log.Printf("Couldn't generate YAML file: %s", err)
		return err
	}
	err = writeFileSafe(configFile, yamlText)
	if err != nil {
		log.Printf("Couldn't save YAML config: %s", err)
		return err
	}

	userFilter := getUserFilter()
	err = userFilter.save()
	if err != nil {
		log.Printf("Couldn't save the user filter: %s", err)
		return err
	}

	return nil
}

// --------------
// coredns config
// --------------
func writeCoreDNSConfig() error {
	coreFile := filepath.Join(config.ourBinaryDir, config.CoreDNS.coreFile)
	log.Printf("Writing DNS config: %s", coreFile)
	configText, err := generateCoreDNSConfigText()
	if err != nil {
		log.Printf("Couldn't generate DNS config: %s", err)
		return err
	}
	err = writeFileSafe(coreFile, []byte(configText))
	if err != nil {
		log.Printf("Couldn't save DNS config: %s", err)
		return err
	}
	return nil
}

func writeAllConfigs() error {
	err := writeConfig()
	if err != nil {
		log.Printf("Couldn't write our config: %s", err)
		return err
	}
	err = writeCoreDNSConfig()
	if err != nil {
		log.Printf("Couldn't write DNS config: %s", err)
		return err
	}
	return nil
}

const coreDNSConfigTemplate = `:{{.Port}} {
    {{if .ProtectionEnabled}}dnsfilter {
        {{if .SafeBrowsingEnabled}}safebrowsing{{end}}
        {{if .ParentalEnabled}}parental {{.ParentalSensitivity}}{{end}}
        {{if .SafeSearchEnabled}}safesearch{{end}}
        {{if .QueryLogEnabled}}querylog{{end}}
        blocked_ttl {{.BlockedResponseTTL}}
		{{if .FilteringEnabled}}
		{{range .Filters}}
		filter {{.ID}} "{{.Path}}"
		{{end}}
		{{end}}
    }{{end}}
    {{.Pprof}}
    hosts {
        fallthrough
    }
    {{if .UpstreamDNS}}upstream {{range .UpstreamDNS}}{{.}} {{end}} { bootstrap 8.8.8.8:53 }{{end}}
    {{.Cache}}
    {{.Prometheus}}
    bind {{.Bind}}
}
`

var removeEmptyLines = regexp.MustCompile("([\t ]*\n)+")

// generate CoreDNS config text
func generateCoreDNSConfigText() (string, error) {
	t, err := template.New("config").Parse(coreDNSConfigTemplate)
	if err != nil {
		log.Printf("Couldn't generate DNS config: %s", err)
		return "", err
	}

	var configBytes bytes.Buffer
	temporaryConfig := config.CoreDNS

	// fill the list of filters
	filters := make([]coreDnsFilter, 0)

	// first of all, append the user filter
	userFilter := getUserFilter()

	if len(userFilter.contents) > 0 {
		filters = append(filters, coreDnsFilter{ID: userFilter.ID, Path: userFilter.getFilterFilePath()})
	}

	// then go through other filters
	for i := range config.Filters {
		filter := &config.Filters[i]

		if filter.Enabled && len(filter.contents) > 0 {
			filters = append(filters, coreDnsFilter{ID: filter.ID, Path: filter.getFilterFilePath()})
		}
	}
	temporaryConfig.Filters = filters

	// run the template
	err = t.Execute(&configBytes, &temporaryConfig)
	if err != nil {
		log.Printf("Couldn't generate DNS config: %s", err)
		return "", err
	}
	configText := configBytes.String()

	// remove empty lines from generated config
	configText = removeEmptyLines.ReplaceAllString(configText, "\n")
	return configText, nil
}
