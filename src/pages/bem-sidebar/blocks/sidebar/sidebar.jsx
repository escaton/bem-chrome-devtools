'use strict';

function getBlocks() {

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

        (elem.className.match(regexp) || []).forEach(function(className) {
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
        this.state = {}
    }
    componentDidMount() {
        var self = this;
        createEvalHelper(function(helper) {
            self.evalHelper = helper;
            helper.defineFunctions([{
                name: 'getBlocks',
                string: getBlocks.toString()
            }], function(result, error) {
                self.elementSelected();
                chrome.devtools.panels.elements.onSelectionChanged.addListener(function() {
                    self.elementSelected();
                });
            });
        });
    }
    elementSelected() {
        var self = this;
        self.evalHelper.executeFunction('getBlocks', [], function(result, error) {
            if (error) {
                console.error(error)
            } else {
                self.setState({
                    blocks: result
                });
            }
        });
    }
    render() {
        var blocks = this.state.blocks;
        if (blocks) {
            var layout = Object.keys(blocks).map(function(blockName) {
                return <Block data={{ name: blockName, params: blocks[blockName] }} />
            });
            return (
                <div className="blocks">
                    <ul className="blocks__list">
                        { layout }
                    </ul>
                </div>
            );
        }
        return false;
    }
};

function init() {
    ReactDOM.render(
        <App/>,
        document.getElementById('app')
    );
}

export default init;
