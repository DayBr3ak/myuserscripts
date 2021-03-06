const $ = window.$;
import emotes from '../emotes';
import { getChatInputController } from '../twitch';

const ORIGINAL_TEXTAREA = '.chat-input textarea';

function setReactTextareaValue(txt, msg) {
    txt.value = msg;
    const ev = new Event('input', { target: txt, bubbles: true });
    txt.dispatchEvent(ev);
}

function newTextArea() {
    const $oldText = $(ORIGINAL_TEXTAREA);
    const $text = $oldText.clone().insertBefore(ORIGINAL_TEXTAREA);
    $text.attr('id', 'bttv-chat-input');
    $oldText.attr('id', 'twitch-chat-input');
    $oldText.hide();
    $text.focus();

    $text[0].customSetValue = value => {
        $text.val(value);
    };

    $oldText[0].customSetValue = value => {
        setReactTextareaValue($oldText[0], value);
    };

    return { $text, $oldText };
}

export default class CustomInputModule {
    constructor(parentModule) {
        this.parentModule = parentModule;
        this.init();
        // watcher.on('input.onSendMessage', () => this.sendMessage());
        // watcher.on('chat.message', ($el, msg) => this.storeUser($el, msg));
    }

    init() {
        this.userList = new Set();
        this.tabTries = -1;
        this.suggestions = null;
        this.textSplit = ['', '', ''];
    }

    storeUser(user) {
        this.userList.add(user.userDisplayName || user.userLogin);
    }

    sendMessage() {
        const message = this.$text.val();
        if (message.trim().length === 0) {
            return;
        }
        this.chatInputCtrl.props.onSendMessage(message);
        this.parentModule.onSendMessage(message);
        this.$text.val('');
    }

    load(createTextarea = true) {
        this.chatInputCtrl = getChatInputController();
        if (createTextarea) {
            const { $text, $oldText } = newTextArea();
            this.$text = $text;
            this.$oldText = $oldText;
            this.userList = new Set();
        }
    }

    enable() {
        this.$text.show();
        this.$oldText.hide();
    }

    disable() {
        this.$text.hide();
        this.$oldText.show();
    }

    getSuggestions(prefix, includeUsers = true, includeEmotes = true) {
        let userList = [];
        let emoteList = [];

        if (includeEmotes) {
            emoteList = emotes.getEmotes(); // .map(emote => emote.code);
            emoteList.push(...this.getTwitchEmotes());
            emoteList = emoteList.filter(word => word.toLowerCase().indexOf(prefix.toLowerCase()) === 0);
            emoteList = Array.from(new Set(emoteList).values());
            emoteList.sort();
        }

        if (includeUsers) {
            userList = this.getChatMembers().filter(word => word.toLowerCase().indexOf(prefix.toLowerCase()) === 0);
            userList.sort();
        }

        return [ ...emoteList, ...userList];
    }

    onKeydown(e, includeUsers) {
        const keyCode = e.key;
        if (e.ctrlKey) {
            return;
        }
        const $inputField = this.$text;

        if (keyCode === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        } else if (keyCode === 'Tab') {
            e.preventDefault();
            this.onAutoComplete(includeUsers, e.shiftKey);
        } else if (keyCode === 'Escape' && this.tabTries >= 0) {
            $inputField.val(this.textSplit.join(''));
        } else if (keyCode !== 'Shift') {
            this.tabTries = -1;
        }
    }

    onFocus() {
        this.tabTries = -1;
    }

    onAutoComplete(includeUsers, shiftKey) {
        const $inputField = this.$text;

        // First time pressing tab, split before and after the word
        if (this.tabTries === -1) {
            const caretPos = $inputField[0].selectionStart;
            const text = $inputField.val();

            const start = (/[\:\(\)\w]+$/.exec(text.substr(0, caretPos)) || {index: caretPos}).index;
            const end = caretPos + (/^\w+/.exec(text.substr(caretPos)) || [''])[0].length;
            this.textSplit = [text.substring(0, start), text.substring(start, end), text.substring(end + 1)];

            // If there are no words in front of the caret, exit
            if (this.textSplit[1] === '') return;

            // Get all matching completions
            const includeEmotes = this.textSplit[0].slice(-1) !== '@';
            this.suggestions = this.getSuggestions(this.textSplit[1], includeUsers, includeEmotes);
        }

        if (this.suggestions.length > 0) {
            this.tabTries += shiftKey ? -1 : 1; // shift key iterates backwards
            if (this.tabTries >= this.suggestions.length) this.tabTries = 0;
            if (this.tabTries < 0) this.tabTries = this.suggestions.length - 1;
            if (!this.suggestions[this.tabTries]) return;

            let cursorOffset = 0;
            if (this.textSplit[2].trim() === '') {
                this.textSplit[2] = ' ';
                cursorOffset = 1;
            }

            const cursorPos = this.textSplit[0].length + this.suggestions[this.tabTries].length + cursorOffset;
            $inputField.val(this.textSplit[0] + this.suggestions[this.tabTries] + this.textSplit[2]);
            $inputField[0].setSelectionRange(cursorPos, cursorPos);
        }
    }

    getTwitchEmotes() {
        const twEmotes = this.chatInputCtrl.props.emotes;
        if (!twEmotes) {
            return [];
        }
        return twEmotes
            .reduce((accum, v) => accum.concat(v.emotes), [])
            .map(emote => emote.displayName);
    }

    getChatMembers() {
        const broadcasterName = this.chatInputCtrl.props.channelDisplayName;
        this.userList.add(broadcasterName);
        return Array.from(this.userList.values());
    }
}

