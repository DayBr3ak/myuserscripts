import debug from './debug';
import chatTabCompletionModule from './tab_completion';
import emotesProvider from './emotes';

import { getConnectRoot,
    setCurrentUser,
    getCurrentChat,
    updateCurrentChannel } from './twitch';

let currentPath;

const routes = {
    DIRECTORY_FOLLOWING_LIVE: 'DIRECTORY_FOLLOWING_LIVE',
    DIRECTORY_FOLLOWING: 'DIRECTORY_FOLLOWING',
    DIRECTORY: 'DIRECTORY',
    CHAT: 'CHAT',
    CHANNEL: 'CHANNEL',
    VOD: 'VOD'
};

const routeKeysToPaths = {
    [routes.DIRECTORY_FOLLOWING_LIVE]: /^\/directory\/following\/live$/i,
    [routes.DIRECTORY_FOLLOWING]: /^\/directory\/following$/i,
    [routes.DIRECTORY]: /^\/directory/i,
    [routes.CHAT]: /^(\/popout)?\/[a-z0-9-_]+\/chat$/i,
    [routes.VOD]: /^\/videos\/[0-9]+$/i,
    [routes.CHANNEL]: /^\/[a-z0-9-_]+/i
};

function getRouteFromPath(path) {
    for (const name of Object.keys(routeKeysToPaths)) {
        const regex = routeKeysToPaths[name];
        if (!regex.test(path)) continue;
        return name;
    }
    return null;
}

function getRouter() {
    return new Promise(resolve => {
        const loadInterval = setInterval(() => {
            let user, router;
            try {
                const connectRoot = getConnectRoot();
                if (!connectRoot) return;
                const context = connectRoot._context;
                router = context.router;
                user = context.store.getState().session.user;
            } catch (_) {
                return;
            }

            if (!router || !user) return;
            clearInterval(loadInterval);

            setCurrentUser(user.authToken, user.id, user.login, user.displayName);
            resolve(router);
        }, 25);
    });
}

function makeCheckChat() {
    let currentChatReference = null;
    return function() {
        if (!updateCurrentChannel()) return false;
        const lastReference = currentChatReference;
        const currentChat = getCurrentChat();

        if (currentChat && currentChat === lastReference) return false;
        currentChatReference = currentChat;

        return true;
    };
}
const checkChat = makeCheckChat();

const wait = t => new Promise(r => setTimeout(r, t));
let isWaiting = false;
async function waitForChat() {
    let abort = false;
    wait(15000)
        .then(() => (abort = true));
    isWaiting = Symbol('waitingForChat');
    const currentIsWaiting = isWaiting;
    while (!abort) {
        if (checkChat()) {
            return true;
        }
        if (isWaiting !== currentIsWaiting) {
            debug.log('waitForChat was cancelled');
            return false;
        }
        await wait(25);
    }
    return false;
}


function triggerRouteChanged() {}

function triggerChatLoaded() {
    debug.log('CHAT WAS LOADED');
    chatTabCompletionModule.load(true);
    emotesProvider.load();
}

function onRouteChange(location) {
    const lastPath = currentPath;
    const path = location.pathname;
    const route = getRouteFromPath(path);
    debug.log(`New route: ${location.pathname} as ${route}`);

    // emit load
    triggerRouteChanged();
    currentPath = path;
    if (currentPath === lastPath) return;
    if (route === routes.CHAT || route === routes.CHANNEL) {
        waitForChat()
            .then(loaded => loaded && triggerChatLoaded());
    }
}

async function main() {
    const router = await getRouter();
    router.history.listen(location => onRouteChange(location));
    onRouteChange(router.history.location);
}

main();


