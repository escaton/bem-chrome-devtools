'use strict';

var connections = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (connections[tabId] && changeInfo.status) {
        connections[tabId].postMessage({
            name: 'window-status',
            value: changeInfo.status
        });
    }
});

chrome.runtime.onConnect.addListener(function(port) {
    var portListener = function(message, sender, sendResponse) {
        if (message.name == 'init') {
            connections[message.tabId] = port;
            port._tabId = message.tabId;
            return;
        }
    }

    port.onMessage.addListener(portListener);

    port.onDisconnect.addListener(function() {
        port.onMessage.removeListener(portListener);
        delete connections[port._tabId];
    });
});
