window.customLog = localStorage.getItem('customLog') === 'true';

let console = window.console;
try {
    console = $('iframe')[0].contentWindow.console;
} catch (e) {}

function log(type, ...args) {
    if (!console || !window.customLog) return;
    console[type].apply(console, ['SCRIPT:'].concat(args));
}

const debug = {
    log: log.bind(this, 'log'),
    error: log.bind(this, 'error'),
    warn: log.bind(this, 'warn'),
    info: log.bind(this, 'info')
};

export default debug;
