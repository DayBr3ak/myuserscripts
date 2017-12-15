// ==UserScript==
// @run-at       document-start
// @name         Twitch BetterTTV without extension
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @description  This script load bttv without having to download the extension;
// @author       Daybr3akz
// @license      MIT
// @copyright    2017, daybreakz (https://openuserjs.org/users/daybreakz)
// @match        https://www.twitch.tv/*
// @grant        unsafeWindow
// ==/UserScript==

// // ==OpenUserJS==
// @author daybreakz
// ==/OpenUserJS==
const STORAGE_ENTRY = 'bttv_from_localhost';

let BTTV_URL = 'https://cdn.betterttv.net/betterttv.js';
const fromLocalhost = localStorage.getItem(STORAGE_ENTRY) === 'true';
if (fromLocalhost) {
    BTTV_URL = 'https://localhost/betterttv.js';
}
unsafeWindow.toggleBttvDev = () => {
    const fromLocalhost = localStorage.getItem(STORAGE_ENTRY) === 'true';
    localStorage.setItem(STORAGE_ENTRY, !fromLocalhost);
    console.log(`changed bttv script to ${fromLocalhost ? 'cdn.betterttv.net' : 'localhost'}. You can refresh to see the changes.`);
    if (!fromLocalhost) {
        console.warn('Don\'t forget to change the CDN url in "src/utils/cdn.js" to localhost, otherwise styles won\'t reflect your changes.');
    }
};
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
        console.warn(`BetterTTV loaded from ${fromLocalhost ? 'localhost' : 'cdn.betterttv.net'}`);
        if (fromLocalhost)
          console.warn('Don\'t forget to change the CDN url in "src/utils/cdn.js" to localhost, otherwise styles won\'t reflect your changes.');
    };
    document.documentElement.appendChild(script);
})();
