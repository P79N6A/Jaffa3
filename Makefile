NATIVE_GOOS = $(shell unset GOOS; go env GOOS)
NATIVE_GOARCH = $(shell unset GOARCH; go env GOARCH)
mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
mkfile_dir := $(patsubst %/,%,$(dir $(mkfile_path)))
GOPATH := $(mkfile_dir)/build/gopath
JSFILES = $(shell find client -path client/node_modules -prune -o -type f -name '*.js')
STATIC = build/static/index.html

TARGET=whitehat

.PHONY: all build clean
all: build

build: $(TARGET)

client/node_modules: client/package.json client/package-lock.json
	npm --prefix client install
	touch client/node_modules

$(STATIC): $(JSFILES) client/node_modules
	npm --prefix client run build-prod

$(TARGET): $(STATIC) *.go coredns_plugin/*.go dnsfilter/*.go
	mkdir -p $(GOPATH)/src/github.com/whitehat
	if [ ! -h $(GOPATH)/src/github.com/whitehat/whitehat ]; then rm -rf $(GOPATH)/src/github.com/whitehat/whitehat && ln -fs $(mkfile_dir) $(GOPATH)/src/github.com/whitehat/whitehat; fi
	GOPATH=$(GOPATH) go get -v -d .
	GOPATH=$(GOPATH) GOOS=$(NATIVE_GOOS) GOARCH=$(NATIVE_GOARCH) go get -v github.com/gobuffalo/packr/...
	mkdir -p $(GOPATH)/src/github.com/whitehat/whitehat/build/static
	#perl -0777 -p -i.bak -e 's/pprofOnce.Do\(func\(\) {(.*)}\)/\1/ms' $(GOPATH)/src/github.com/coredns/coredns/plugin/pprof/setup.go
	perl -0777 -p -i.bak -e 's/c.OnShutdown/c.OnRestart/' $(GOPATH)/src/github.com/coredns/coredns/plugin/pprof/setup.go
	GOPATH=$(GOPATH) PATH=$(GOPATH)/bin:$(PATH) packr build -ldflags="-X main.VersionString=0.2" -o $(TARGET)

clean:
	$(MAKE) cleanfast
	rm -rf build
	rm -rf client/node_modules

cleanfast:
	rm -f $(TARGET)
