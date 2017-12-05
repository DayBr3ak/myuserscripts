// ==UserScript==
// @name         Twitch BetterTTV without extension and better dark theme
// @namespace    http://tampermonkey.net/
// @version      1.0.5
// @description  This script load bttv without having to download the extension; Also have a better dark theme, try it!
// @author       Daybr3akz
// @license      MIT
// @copyright    2017, daybreakz (https://openuserjs.org/users/daybreakz)
// @match        https://www.twitch.tv/*
// @grant        none
// ==/UserScript==

/*
 * This user script loads 2 external scripts aka
 * https://cdn.betterttv.net/betterttv.js ,see https://github.com/night/BetterTTV
 * https://userstyles.org/styles/userjs/148766/dark-theme-for-twitchtv , see https://usertyles.org/
 */

// fix screen glitch when player goes from theatre mode to full screen.
const css = [ '<style>',
    '.video-player--theatre.video-player--fullscreen .video-player__container {',
    '    bottom: 0rem!important',
    '}</style>'].join('\n');
document.head.appendChild($(css)[0]);

(function betterttv() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.betterttv.net/betterttv.js';
    script.onload = () => console.log('BetterTTV loaded');
    const head = document.getElementsByTagName('head')[0];
    if (!head) return;
    head.appendChild(script);
})();

const DEFAULT_DARK_THEME = 'https://userstyles.org/styles/userjs/148766/dark-theme-for-twitchtv.user.js';
(function darkThemeManager() {
    function loadStyle(src, callback) {
        // nothing malicious, this is a Stylish userscript loading some css;
        // we are going to hook that css, allowing to disable it in light mode

        // we need the style element that is added to the DOM by this script;
        // so we monkeypatch it!
        const oldCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const node = oldCreateElement.apply(this, arguments);
            if (tagName === 'style') {
                node.setAttribute('media', 'none'); // disableCSS on load
                callback(node);
                document.createElement = oldCreateElement;
            }
            return node;
        };

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        const head = document.getElementsByTagName('head')[0];
        if (!head) return;
        head.appendChild(script);
    }

    let styleNode;
    function onThemeChange(isDark) {
        if (!styleNode) return;
        styleNode.setAttribute('media', isDark ? '' : 'none');
    }

    let bodyObserver;
    function setupObserver() {
        // setup an observer to detect body class changes
        let bodyHasDark = 'unknown';
        bodyObserver = new MutationObserver(() => {
            const current = $('body').hasClass('theme--dark');
            if (bodyHasDark !== current) {
                bodyHasDark = current;
                onThemeChange(current);
            }
        });

        bodyObserver.observe(document.body, {
            attributes: true, // only interested in attributes
            childList: false,
            characterData: false
        });
    }

    loadStyle(DEFAULT_DARK_THEME, loadedStyleNode => {
        styleNode = loadedStyleNode;
        onThemeChange($('body').hasClass('theme--dark'));
    });

    setupObserver();
})();
