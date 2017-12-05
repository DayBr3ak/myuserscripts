const REACT_ROOT = '#root div[data-reactroot]';
const CHAT_CONTAINER = '.chat-room__container';
const CHAT_INPUT = '.chat-input';
// const $ = s => document.querySelectorAll(s);
const $ = window.$;

function getReactInstance(element) {
    for (const key in element) {
        if (key.startsWith('__reactInternalInstance$')) {
            return element[key];
        }
    }
    return null;
}

function getReactElement(element) {
    const instance = getReactInstance(element);
    if (!instance) return null;
    return instance._currentElement;
}

function getParentNode(reactElement) {
    try {
        return reactElement._owner._currentElement._owner;
    } catch (_) {
        return null;
    }
}

function searchReactChildren(node, predicate, maxDepth = 15, depth = 0) {
    try {
        if (predicate(node)) {
            return node;
        }
    } catch (_) {}

    if (!node || depth > maxDepth) {
        return null;
    }

    const {_renderedChildren: children, _renderedComponent: component} = node;

    if (children) {
        for (const key of Object.keys(children)) {
            const childResult = searchReactChildren(children[key], predicate, maxDepth, depth + 1);
            if (childResult) {
                return childResult;
            }
        }
    }

    if (component) {
        return searchReactChildren(component, predicate, maxDepth, depth + 1);
    }

    return null;
}

export function getConnectRoot() {
    let root;
    try {
        root = getParentNode(getReactElement($(REACT_ROOT)[0]));
    } catch (_) {}
    return root;
}

export function getChatController() {
    const container = $(CHAT_CONTAINER).parent()[0];
    if (!container) return null;

    let controller = searchReactChildren(
        getReactInstance(container),
        node => node._instance && node._instance.chatBuffer
    );

    if (controller) {
        controller = controller._instance;
    }

    return controller;
}

export function getChatInputController() {
    const container = $(CHAT_INPUT)[0];
    if (!container) return null;

    let controller;
    try {
        controller = getParentNode(getReactElement(container))._instance;
    } catch (_) {}

    return controller;
}

export function getCurrentChat() {
    const container = $(CHAT_CONTAINER)[0];
    if (!container) return null;
    let controller;
    try {
        controller = getParentNode(getReactElement(container))._instance;
    } catch (_) {}
    return controller;
}

let currentUser = null;
export function setCurrentUser(accessToken, id, name, displayName) {
    // twitchAPI.setAccessToken(accessToken);
    currentUser = {
        id: id.toString(),
        name,
        displayName
    };
}

export function getCurrentUser() {
    return currentUser;
}

let currentChannel;
export function getCurrentChannel() {
    return currentChannel;
}

export function updateCurrentChannel() {
    let rv;
    const currentChat = getCurrentChat();
    if (currentChat && currentChat.props && currentChat.props.channelID) {
        const {channelID, channelLogin, channelDisplayName} = currentChat.props;
        rv = {
            id: channelID.toString(),
            name: channelLogin,
            displayName: channelDisplayName
        };
    }
    currentChannel = rv;
    return rv;
}

