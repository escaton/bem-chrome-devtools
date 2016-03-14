'use strict';

import React from 'react';

class InspectItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false
        }
    }
    onCollapseToggle() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    render() {
        var self = this;
        var props = self.props;
        var node = props.node;
        var type = props.type;
        var isPrimitive = props.isPrimitive;
        var needCollapseToggle = props.needCollapseToggle;
        var isCollapsed = this.state.collapsed;
        return (
            <li className={
                'tree-inspect__item' +
                ' tree-inspect__item_type_' + type +
                ' tree-inspect__item_collapsable_' + (needCollapseToggle ? 'yes' : 'no') +
                ' tree-inspect__item_primitive_' + (isPrimitive ? 'yes' : 'no')
            }>
                <span className="tree-inspect__label">
                    { needCollapseToggle
                        ? <i className={
                            'tree-inspect__collapse-toggle' +
                            ' tree-inspect__collapse-toggle_collapsed_' + (isCollapsed ? 'yes' : 'no')
                            } onClick={self.onCollapseToggle.bind(self)}>
                        </i>
                        : false
                    }
                    {node}
                </span>
                <span className={
                    'tree-inspect__value' +
                    ' tree-inspect__value_collapsed_' + (isCollapsed ? 'yes' : 'no')
                }>
                    {this.props.children}
                </span>
            </li>
        );
    }
}

class TreeInspect extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        var self = this;
        var data = self.props.data || {};

        var nodes = Object.keys(data).map((node, index) => {
            var value = data[node];
            var content;
            var needCollapseToggle = false;
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
                <InspectItem
                    key={index}
                    node={node}
                    type={typeof(value)}
                    isPrimitive={isPrimitive}
                    needCollapseToggle={needCollapseToggle}
                >
                    {content}
                </InspectItem>
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
