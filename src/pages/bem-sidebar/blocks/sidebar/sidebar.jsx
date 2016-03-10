'use strict';

function getBlocks() {
    var el = $0;
    var classes = Array.prototype.slice.call($0.classList, 0);
    var res = [];
    if (!~classes.indexOf('i-bem')) {
        return res;
    }
    var bemData = el.dataset.bem;
    if (!bemData) {
        return [];
    }
    var jsData = JSON.parse(bemData);
    return jsData;
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
