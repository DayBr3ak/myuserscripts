import CustomInputModule from './custom-input-module';
// const InputPatcherModule = require('./input-patcher-module');
import ChatHistoryModule from './chat-history-module';

import { getChatController } from '../twitch';
import debug from '../debug';
// window.getChatController = getChatController;

const CHAT_INPUT = '.chat-input';
const $ = window.$;

function patchSendMessage(callback) {
    const chatBuffer = getChatController().chatBuffer;
    debug.log(chatBuffer);

    if (chatBuffer._consumeChatEventPatched === true) {
        return;
    }
    chatBuffer._consumeChatEventPatched = true;
    const twitchConsumeChatEvent = chatBuffer.consumeChatEvent;

    function myConsumeChatEvent(event) {
        if (event && event.type === 0) {
            try {
                callback(event);
            } catch (error) {
                debug.error(error);
            }
        }
        return twitchConsumeChatEvent.apply(this, arguments);
    }
    chatBuffer.consumeChatEvent = myConsumeChatEvent;
}


class ChatTabCompletionModule {
    constructor() {
        this.customInput = new CustomInputModule(this);
        this.chatHistory = new ChatHistoryModule(this);
        this.currentInput = null;

        // watcher.on('load.chat', () => this.load());
        // settings.on('changed.tabAutocomplete', () => this.load(false));

        $('body').off('click.tabComplete focus.tabComplete keydown.tabComplete')
            .on('click.tabComplete focus.tabComplete', CHAT_INPUT, () => this.onFocus())
            .on('keydown.tabComplete', CHAT_INPUT, e => this.onKeydown(e));
    }

    load(chatLoad = true) {
        this.customInput.load(chatLoad);
        this.chatHistory.load(chatLoad);
        // if (settings.get('tabAutocomplete')) {
        this.customInput.enable();
        this.currentInput = this.customInput;
        // } else {
        //     this.customInput.disable();
        //     this.currentInput = this.patchedInput;
        // }
        patchSendMessage(event => {
            this.currentInput.storeUser(event.user);
        });
    }

    onKeydown(e) {
        if (this.currentInput) {
            this.currentInput.onKeydown(e);
        }
        this.chatHistory.onKeydown(e);
    }

    onFocus() {
        if (this.currentInput) {
            this.currentInput.onFocus();
        }
        this.chatHistory.onFocus();
    }

    onSendMessage(message) {
        this.chatHistory.onSendMessage(message);
    }
}

const mod = new ChatTabCompletionModule();
export default mod;
