'use strict';

var winToDevtab = {};
var devtabToWin = {};
var winToContentscript = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (winToDevtab[tabId] && changeInfo.status) {
        winToDevtab[tabId].postMessage({
            cmd: 'window-status',
            value: changeInfo.status
        });
    }
});

function sidebarListener(message) {
    console.log('sidebar message', message);
    var port = this.port;
    switch (message.cmd) {
        case 'init':
            if (message.tabId === undefined) return;
            winToDevtab[message.tabId] = port;
            devtabToWin[port.sender.tab.id] = message.tabId;
            break;
        case 'inject-content-script':
            if (message.tabId === undefined) return;
            chrome.tabs.executeScript(message.tabId, {
                file: 'pages/content-script/content-script.js'
            }, () => {
                port.postMessage({
                    cmd: 'content-script-injected'
                });
            });
            break;
        default:
    }
}

var contentListener = function(message, port) {
    console.log('content script message', message);
    var port = this.port;
    switch (message.cmd) {
        case 'changed':
            var win = port.sender.tab.id;
            if (winToDevtab[win]) {
                winToDevtab[win].postMessage({
                    cmd: 'watch-changes'
                });
            } else {
                // sidebar detached
                port.postMessage({
                    cmd: 'destruct'
                });
            }
            break;
        default:
    }
}

chrome.runtime.onConnect.addListener((port) => {

    if (port.name === 'sidebar') {
        console.log('sidebar connected');
        port.onMessage.addListener(sidebarListener.bind({ port: port }));
        port.onDisconnect.addListener(function(port) {
            console.log('sidebar disconnected');
            port.onMessage.removeListener(sidebarListener);
            var win = devtabToWin[port.sender.tab.id];
            var contentScript = winToContentscript[win];
            if (contentScript) {
                contentScript.postMessage({
                    cmd: 'destruct'
                });
            }
            delete winToDevtab[win];
            delete devtabToWin[port.sender.tab.id];
        });
    } else if (port.name === 'content-script') {
        console.log('content script connected');
        var win = port.sender.tab.id;
        winToContentscript[win] = port;
        port.onMessage.addListener(contentListener.bind({ port: port }));
        port.onDisconnect.addListener(function(port) {
            console.log('content script disconnected');
            port.onMessage.removeListener(contentListener);
            delete winToContentscript[port.sender.tab.id];
        });
    }

});
