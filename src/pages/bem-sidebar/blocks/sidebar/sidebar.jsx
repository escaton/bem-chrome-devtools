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

function getBlocks() {

    if (!BEM) {
        throw new Error('No BEM on page');
    }

    var self = this; // window[NAMESPACE]
    var el = $0;
    var blockRegex = new RegExp('(\\s|^)' + BEM.INTERNAL.NAME_PATTERN + '(?=\\s|$)');
    var classes = Array.prototype.slice.call(el.classList, 0);
    var res = {
        blocks: {}
    };
    var hasIBem = false;
    classes.forEach((className) => {
        if (className === 'i-bem') {
            hasIBem = true;
            return;
        }
        if (blockRegex.test(className)) {
            var mods = self.extractMods(el, className);
            res.blocks[className] = {
                mods: mods
            }
        }
    });
    var bemData = el.dataset.bem;
    if (bemData) {
        var jsData = JSON.parse(bemData);
        Object.keys(jsData).forEach((block) => {
            res.blocks[block] = res.blocks[block] || {};
            res.blocks[block].params = jsData[block];
            res.blocks[block].iBem = hasIBem && !!BEM.blocks[block];
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
            blocks: {},
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
                name: 'getBlocks',
                string: getBlocks.toString()
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
            self.evalHelper.executeFunction('getBlocks', [], (result, error) => {
                if (error) {
                    console.error(error)
                } else {
                    self.setState({
                        blocks: result.blocks
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
        var blocks = this.state.blocks;
        var blockNames = Object.keys(blocks);
        var content;
        if (blocks && blockNames.length) {
            var list = blockNames.map((blockName) => {
                return <Block data={{ name: blockName, params: blocks[blockName] }} />
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
