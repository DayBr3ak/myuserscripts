// ==UserScript==
// @run-at       document-start
// @name         Twitch BetterTTV without extension
// @namespace    http://tampermonkey.net/
// @version      1.0.12
// @description  This script load bttv without having to download the extension;
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
 * This user script loads 1 external scripts aka
 * https://cdn.betterttv.net/betterttv.js ,see https://github.com/night/BetterTTV
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
