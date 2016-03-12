'use strict';

function getBlocks() {

    if (!BEM) {
        throw new Error('No BEM on page');
    }

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

    var el = $0;
    var blockRegex = new RegExp('(\\s|^)' + BEM.INTERNAL.NAME_PATTERN + '(?=\\s|$)');
    var classes = Array.prototype.slice.call(el.classList, 0);
    var res = {};
    classes
        .forEach((className) => {
            if (className === 'i-bem') {
                return;
            }
            if (blockRegex.test(className)) {
                var mods = extractMods(el, className);
                res[className] = {
                    mods: mods
                }
            }
        });
    var bemData = el.dataset.bem;
    if (bemData) {
        var jsData = JSON.parse(bemData);
        Object.keys(jsData).forEach((block) => {
            res[block] = res[block] || {};
            res[block].params = jsData[block];
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

        var backgroundPageConnection = chrome.runtime.connect({
            name: 'bem-sidebar'
        });

        backgroundPageConnection.onMessage.addListener(self.onBackgoundMessage.bind(self));

        backgroundPageConnection.postMessage({
            tabId: chrome.devtools.inspectedWindow.tabId,
            name: 'init'
        });
        chrome.devtools.panels.elements.onSelectionChanged.addListener(self.elementSelected.bind(self));
        self.inject();
    }
    onBackgoundMessage(data) {
        var self = this;
        switch (data.name) {
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
            default:
        }
    }
    inject() {
        var self = this;
        createEvalHelper((helper) => {
            helper.defineFunctions([{
                name: 'getBlocks',
                string: getBlocks.toString()
            }], (result, error) => {
                if (error) {
                    console.error(error)
                } else {
                    self.evalHelper = helper;
                    self.setState({
                        ready: true
                    }, () => {
                        self.elementSelected();
                    });
                }
            });
        });
    }
    elementSelected() {
        var self = this;
        if (self.state.ready) {
            self.evalHelper.executeFunction('getBlocks', [], (result, error) => {
                if (error) {
                    console.error(error)
                } else {
                    self.setState({
                        blocks: result
                    });
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
                    { list }
                </ul>
            );
        } else {
            content = (
                <span className="blocks__info">No blocks</span>
            );
        }
        return (
            <div className="blocks">
                { content }
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
