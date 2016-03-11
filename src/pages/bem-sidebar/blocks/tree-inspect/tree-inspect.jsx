'use strict';

import React from 'react';

class TreeInspect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: {}
        }
    }
    onCollapseToggle(name) {
        var collapsed = this.state.collapsed;
        collapsed[name] = !collapsed[name];
        this.setState({
            collapsed: collapsed
        });
    }
    render() {
        var self = this;
        var data = self.props.data || {};

        var nodes = Object.keys(data).map((node, index) => {
            var value = data[node];
            var content;
            var needCollapseToggle = false;
            var isCollapsed = self.state.collapsed[node];
            var isPrimitive = true;
            if (typeof value === 'object') {
                if (value === null) {
                    content = "null";
                } else if (Object.keys(value).length) {
                    needCollapseToggle = true;
                    isPrimitive = false;
                    content = <TreeInspect data={value}/>
                } else {
                    content = "{}";
                }
            } else {
                content = JSON.stringify(value);
            }
            return (
                <li className={
                    'tree-inspect__item' +
                    ' tree-inspect__item_type_' + typeof(value) +
                    ' tree-inspect__item_collapsable_' + (needCollapseToggle ? 'yes' : 'no') +
                    ' tree-inspect__item_primitive_' + (isPrimitive ? 'yes' : 'no')
                }>
                    <span className="tree-inspect__label">
                        { needCollapseToggle
                            ? <i className={
                                'tree-inspect__collapse-toggle' +
                                ' tree-inspect__collapse-toggle_collapsed_' + (isCollapsed ? 'yes' : 'no')
                                } onClick={self.onCollapseToggle.bind(self, node)}></i>
                            : false
                        }
                        {node}
                    </span>
                    <span className={"tree-inspect__value tree-inspect__value_collapsed_" + (isCollapsed ? 'yes' : 'no')}>{content}</span>
                </li>
            );
        });
        if (nodes.length) {
            return (
                <ul className="tree-inspect">
                    {nodes}
                </ul>
            )
        } else {
            return false;
        }
    }
}

export default TreeInspect;
