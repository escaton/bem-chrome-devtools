'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Block from '../block/block.jsx';
import createEvalHelper from '../eval-helper/eval-helper.js';
import * as injectedHelpers from '../injected-helpers/injected-helpers.js';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            entities: {},
            ready: false
        }
    }
    componentDidMount() {
        var self = this;

        self.backgroundPageConnection = chrome.runtime.connect({
            name: 'sidebar'
        });
        self.backgroundPageConnection.onMessage.addListener(self.onMessage.bind(self));
        self.backgroundPageConnection.postMessage({
            cmd: 'init',
            tabId: chrome.devtools.inspectedWindow.tabId
        });
        chrome.devtools.panels.elements.onSelectionChanged.addListener(self.elementSelected.bind(self, true));
        window.addEventListener('message', (e) => {
            self.onMessage(e.data);
        }, false);
        self.inject();
    }
    onMessage(data) {
        var self = this;
        switch (data.cmd) {
            case 'window-status':
                switch (data.value) {
                    case 'loading':
                        self.setState({
                            ready: false
                        });
                        break;
                    case 'complete':
                        self.inject();
                        break;
                    default:
                }
                break;
            case 'sidebar-status':
                switch (data.value) {
                    case 'shown':
                        self.watch();
                        break;
                    case 'hidden':
                        self.stopWatching();
                        break;
                    default:
                }
                break;
            case 'content-script-injected':
                self.setState({
                    ready: true
                }, () => {
                    self.elementSelected(true);
                });
                break;
            case 'watch-changes':
                self.elementSelected();
                break;
            case 'mod-add':
                self.modAdd(data.owner, data.mod);
                break;
            case 'mod-remove':
                self.modRemove(data.owner, data.mod);
                break;
            default:
        }
    }
    modAdd(owner, mod) {
        var self = this;
        self.evalHelper.executeFunction('modAdd', [owner, mod], (result, error) => {
            if (error) {
                console.error(error);
            }
        });
    }
    modRemove(owner, mod) {
        var self = this;
        self.evalHelper.executeFunction('modRemove', [owner, mod], (result, error) => {
            if (error) {
                console.error(error);
            }
        });
    }
    watch() {
        var self = this;
        // first call is initial
        if (self.state.ready) {
            self.elementSelected(true);
        }
    }
    stopWatching() {
        var self = this;
        self.evalHelper._eval('stopWatching()', {
            useContentScriptContext: true
        });
    }
    inject() {
        var self = this;
        createEvalHelper((helper) => {
            helper.defineFunctions([{
                name: 'getEntities',
                string: injectedHelpers.getEntities.toString()
            }, {
                name: 'extractMods',
                string: injectedHelpers.extractMods.toString()
            }, {
                name: 'modAdd',
                string: injectedHelpers.modAdd.toString()
            }, {
                name: 'modRemove',
                string: injectedHelpers.modRemove.toString()
            }], (result, error) => {
                if (error) {
                    console.error(error);
                } else {
                    self.evalHelper = helper;
                    self.backgroundPageConnection.postMessage({
                        cmd: 'inject-content-script'
                    });
                }
            });
        });
    }
    elementSelected(watch) {
        var self = this;
        if (self.state.ready) {
            self.evalHelper.executeFunction('getEntities', [], (result, error) => {
                if (error) {
                    console.error(error)
                } else {
                    self.setState({
                        entities: result.entities
                    });
                    if (watch) {
                        self.evalHelper._eval("watchSelectedElement($0)", {
                            useContentScriptContext: true
                        }, (result, error) => {
                            if (error) {
                                console.error(error);
                            }
                        });
                    }
                }
            });
        }
    }
    render() {
        var entities = this.state.entities;
        var entityNames = Object.keys(entities);
        var content;
        if (entities && entityNames.length) {
            var list = entityNames.map((name) => {
                return <Block name={name} data={entities[name]} />
            });
            content = (
                <ul className="blocks__list">
                    {list}
                </ul>
            );
        } else {
            content = (
                <span className="blocks__info">No blocks</span>
            );
        }
        return (
            <div className="blocks">
                {content}
            </div>
        );
    }
};

function init() {
    ReactDOM.render(
        <App/>,
        document.getElementById('app')
    );
}

export default init;
