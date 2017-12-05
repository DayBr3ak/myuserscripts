
import debug from './debug';
import { getCurrentUser, getCurrentChannel } from './twitch';
const API_ENDPOINT = 'https://api.betterttv.net/2/';
const fetchJson = path => fetch(`${API_ENDPOINT}${path}`).then(r => r.json());

let channel = {};

class EmotesProvider {
    constructor() {
        this.channelEmotes = new Set();
        this.globalEmotes = new Set();
        this.emojis = new Set();
        this.loadBTTVGlobalEmotes();
        // this.loadEmojis();
    }

    async updateChannel() {
        const currentChannel = getCurrentChannel();
        if (!currentChannel) return;

        if (currentChannel.id === channel.id) return;
        channel = currentChannel;
        return await fetchJson(`channels/${channel.name}`);
    }

    async load() {
        // called from outside
        const channelData = await this.updateChannel();
        if (channelData && channelData.emotes) {
            this.loadBTTVChannelEmotes(channelData.emotes);
        }
    }

    async loadBTTVGlobalEmotes() {
        // should be run once
        const x = await fetchJson('emotes');
        const emotesJson = x.emotes;
        emotesJson.forEach(em => {
            if (!em || !em.code) return;
            this.globalEmotes.add(em.code);
        });
        debug.log('Got globalEmotes');
    }

    loadBTTVChannelEmotes(emotesJson) {
        this.channelEmotes.clear();
        emotesJson.forEach(em => {
            if (!em || !em.code) return;
            this.channelEmotes.add(em.code);
        });
        debug.log('Got channel emotes');
    }

    getEmotes() {
        if (!window.BetterTTV) {
            return [];
        }
        const user = getCurrentUser(); user;

        const emotes = [...this.globalEmotes]
            // .concat([...this.emojis])
            .concat([...this.channelEmotes]);
        return emotes;
    }
}

// let provider = new NopeProvider();
// if (window.BetterTTV) {
const provider = new EmotesProvider();
export default provider;
