'use strict';

var backgroundPageConnection = chrome.runtime.connect({
    name: 'content-script'
});
function onMessage(data) {
    switch (data.cmd) {
        case 'stop-watching':
            stopWatching();
            break;
        case 'destruct':
            stopWatching();
            backgroundPageConnection.disconnect();
            break;
        default:
    }
}

backgroundPageConnection.onMessage.addListener(onMessage);

var observer = new MutationObserver(() => {
    backgroundPageConnection.postMessage({
        cmd: 'changed'
    });
});

var config = {
    attributes: true,
    attributeFilter: ['class']
};

function watchSelectedElement(el) {
    observer.disconnect();
    observer.observe(el, config);
}

function stopWatching() {
    observer.disconnect();
}
