// ==UserScript==
// @run-at       document-start
// @name         Twitch BetterTTV without extension and better dark theme
// @namespace    http://tampermonkey.net/
// @version      1.0.10
// @description  This script load bttv without having to download the extension; Also have a better dark theme, try it!
// @author       Daybr3akz
// @license      MIT
// @copyright    2017, daybreakz (https://openuserjs.org/users/daybreakz)
// @match        https://www.twitch.tv/*
// ==/UserScript==

// // ==OpenUserJS==
// @author daybreakz
// ==/OpenUserJS==

const BTTV_URL = 'https://cdn.betterttv.net/betterttv.js';
const DEFAULT_DARK_THEME = 'https://userstyles.org/styles/userjs/148766/dark-theme-for-twitchtv.user.js';

/*
 * This user script loads 2 external scripts aka
 * https://cdn.betterttv.net/betterttv.js ,see https://github.com/night/BetterTTV
 * https://userstyles.org/styles/userjs/148766/dark-theme-for-twitchtv , see https://usertyles.org/
 */

(function patchCss() {
    // fix screen glitch when player goes from theatre mode to full screen.
    const css = `
    .video-player--theatre.video-player--fullscreen .video-player__container {
        bottom: 0rem!important
    }`;
    const style = document.createElement('style');
    style.textContent = css;
    document.documentElement.appendChild(style);
})();

(function betterttv() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = BTTV_URL;
    // script.src = 'https://localhost/betterttv.js';
    script.onload = () => {
        console.log('BetterTTV loaded');
    };
    document.documentElement.appendChild(script);
})();

(function darkThemeManager() {
    async function loadStyle(src, callback) {
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
        document.documentElement.appendChild(script);
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
            const current = document.body.classList.contains('theme--dark');
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
        onThemeChange(document.body.classList.contains('theme--dark'));
    });

    setTimeout(setupObserver, 0);
})();
