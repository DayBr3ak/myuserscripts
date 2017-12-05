const $ = window.$;

function isSuggestionsShowing() {
    return !!$('[data-a-target="autocomplete-balloon"]')[0];
}

class ChatHistoryModule {
    constructor(parentModule) {
        this.parentModule = parentModule;
    }

    load(resetHistory) {
        if (resetHistory) {
            this.messageHistory = [];
        }
        this.historyPos = -1;
    }

    onKeydown(e) {
        const keyCode = e.key;
        if (e.ctrlKey) {
            return;
        }
        const $inputField = $(e.target);
        const setInputValue = value => {
            e.target.customSetValue(value);
        };

        if (keyCode === 'ArrowUp') {
            if (isSuggestionsShowing()) return;
            if ($inputField[0].selectionStart > 0) return;
            if (this.historyPos + 1 === this.messageHistory.length) return;
            const prevMsg = this.messageHistory[++this.historyPos];
            setInputValue(prevMsg);
            $inputField[0].setSelectionRange(0, 0);
        } else if (keyCode === 'ArrowDown') {
            if (isSuggestionsShowing()) return;
            if ($inputField[0].selectionStart < $inputField.val().length) return;
            if (this.historyPos > 0) {
                const prevMsg = this.messageHistory[--this.historyPos];
                setInputValue(prevMsg);
                $inputField[0].setSelectionRange(prevMsg.length, prevMsg.length);
            } else {
                const draft = $inputField.val().trim();
                if (this.historyPos < 0 && draft.length > 0) {
                    this.messageHistory.unshift(draft);
                }
                this.historyPos = -1;
                $inputField.val('');
                setInputValue('');
            }
        } else if (this.historyPos >= 0) {
            this.messageHistory[this.historyPos] = $inputField.val();
        }
    }

    onSendMessage(message) {
        if (message.trim().length === 0) return;
        this.messageHistory.unshift(message);
        this.historyPos = -1;
        // watcher.emit('input.onSendMessage', message);
    }

    onFocus() {
        this.historyPos = -1;
    }
}

export default ChatHistoryModule;

