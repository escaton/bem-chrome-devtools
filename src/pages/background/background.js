'use strict';

var sidebarConnections = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (sidebarConnections[tabId] && changeInfo.status) {
        sidebarConnections[tabId].port.postMessage({
            cmd: 'window-status',
            value: changeInfo.status
        });
    }
});

chrome.runtime.onConnect.addListener((port) => {
    var sidebarListener = function(message, sender) {
        switch (message.cmd) {
            case 'init':
                port._tabId = message.tabId;
                sidebarConnections[port._tabId] = {
                    port: port
                };
                break;
            case 'inject-content-script':
                chrome.tabs.executeScript(port._tabId, {
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

    var contentListener = function(message, sender) {
        switch (message.cmd) {
            case 'changed':
                var tabId = sender.sender.tab.id;
                if (sidebarConnections[tabId]) {
                    sidebarConnections[tabId].port.postMessage({
                        cmd: 'watch-changes'
                    });
                } else {
                    console.error('content script detached from sidebar');
                    sender.postMessage({
                        cmd: 'stop-watching'
                    });
                }
                break;
            default:
        }
    }

    if (port.name === 'sidebar') {
        port.onMessage.addListener(sidebarListener);
        port.onDisconnect.addListener(function() {
            port.onMessage.removeListener(sidebarListener);
            if (sidebarConnections[port._tabId].contentScriptPort) {
                sidebarConnections[port._tabId].contentScriptPort.postMessage({
                    cmd: 'stop-watching'
                });
            }
            delete sidebarConnections[port._tabId];
        });
    } else if (port.name === 'content-script') {
        var tabId = port.sender.tab.id;
        if (sidebarConnections[tabId]) {
            sidebarConnections[tabId].contentScriptPort = port;
            port.onMessage.addListener(contentListener);
            port.onDisconnect.addListener(function() {
                port.onMessage.removeListener(contentListener);
            });
        }
    }

});
