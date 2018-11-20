export const R_URL_REQUIRES_PROTOCOL = /^https?:\/\/\w[\w_\-.]*\.[a-z]{2,8}[^\s]*$/;

export const STATS_NAMES = {
    avg_processing_time: 'Average processing time',
    blocked_filtering: 'Blocked by filters',
    dns_queries: 'DNS queries',
    replaced_parental: 'Blocked adult websites',
    replaced_safebrowsing: 'Blocked malware/phishing',
    replaced_safesearch: 'Enforced safe search',
};

export const STATUS_COLORS = {
    blue: '#467fcf',
    red: '#cd201f',
    green: '#5eba00',
    yellow: '#f1c40f',
};

export const REPOSITORY = {
    URL: 'https://whitehat.ro',
    TRACKERS_DB: 'https://gist.githubusercontent.com/happyhater/0eeacb91f30dfe99fecb6c38199f11bc/raw/b5e7d96a6e8a6365a82e801e25dd7a874ebb70fa/whitehat.json',
};
