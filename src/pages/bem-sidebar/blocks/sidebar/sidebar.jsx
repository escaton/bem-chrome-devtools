'use strict';

function extractMods(elem, name) {
    var res = {};
    var MOD_DELIM = BEM.INTERNAL.MOD_DELIM;
    var NAME_PATTERN = BEM.INTERNAL.NAME_PATTERN;
    var regexp = new RegExp([
            '(\\s|^)',
            name,
            MOD_DELIM,
            '(',
            NAME_PATTERN,
            ')',
            MOD_DELIM,
            '(',
            NAME_PATTERN,
            ')(?=\\s|$)'
        ].join(''), 'g');

    (elem.className.match(regexp) || []).forEach((className) => {
        var iModVal = (className = className.trim()).lastIndexOf(MOD_DELIM),
            iModName = className.substr(0, iModVal - 1).lastIndexOf(MOD_DELIM);
        res[className.substr(iModName + 1, iModVal - iModName - 1)] = className.substr(iModVal + 1);
    });
    return res;
}

function getEntities() {

    if (!BEM) {
        throw new Error('No BEM on page');
    }

    var self = this; // window[NAMESPACE]
    var el = $0;
    var NAME_PATTERN = BEM.INTERNAL.NAME_PATTERN;
    var ELEM_DELIM = BEM.INTERNAL.ELEM_DELIM;
    var blockRegex = new RegExp('^' + NAME_PATTERN + '$');
    var elemRegex = new RegExp('^(' + NAME_PATTERN + ')' + ELEM_DELIM + '(' + NAME_PATTERN + ')$');
    var classes = Array.prototype.slice.call(el.classList, 0);
    var res = {
        entities: {}
    };
    var hasIBem = false;
    classes.forEach((className) => {
        if (className === 'i-bem') {
            hasIBem = true;
            return;
        }
        if (blockRegex.test(className)) {
            var mods = self.extractMods(el, className);
            res.entities[className] = {
                block: className,
                mods: mods
            }
        } else if (elemRegex.test(className)) {
            var mods = self.extractMods(el, className);
            var parts = className.match(elemRegex);
            res.entities[className] = {
                block: parts[1],
                elem: parts[2],
                mods: mods
            }
        }
    });
    var bemData = el.dataset.bem;
    if (bemData) {
        var jsData = JSON.parse(bemData);
        Object.keys(jsData).forEach((name) => {
            var entity = res.entities[name] = res.entities[name] || {};
            entity.params = jsData[name];
            entity.iBem = hasIBem && !!BEM.blocks[name];
            entity.liveInit = entity.iBem && !!BEM.blocks[name]._liveInitable;
        });
    }
    return res;
}

import React from 'react';
import ReactDOM from 'react-dom';
import Block from '../block/block.jsx';
import createEvalHelper from '../eval-helper/eval-helper.js';

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
        chrome.devtools.panels.elements.onSelectionChanged.addListener(self.elementSelected.bind(self));
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
            default:
        }
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
        self.evalHelper._eval("stopWatching()", {
            useContentScriptContext: true
        });
    }
    inject() {
        var self = this;
        createEvalHelper((helper) => {
            helper.defineFunctions([{
                name: 'getEntities',
                string: getEntities.toString()
            }, {
                name: 'extractMods',
                string: extractMods.toString()
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
