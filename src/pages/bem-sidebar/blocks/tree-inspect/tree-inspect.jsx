'use strict';

import React from 'react';

class TreeInspect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: this.props.collapsed
        }
    }
    onCollapseToggle() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }
    render() {
        var self = this;
        var data = self.props.data || {};
        var label = self.props.label;
        if (label) {
            if (Object.keys(data).length) {
                return (
                    <li className="tree-inspect__item">
                        <span className="tree-inspect__label tree-inspect__label_type_object">
                            <i className={"tree-inspect__collapse-toggle  tree-inspect__collapse-toggle_collapsed_" + (self.state.collapsed ? 'yes' : 'no')} onClick={self.onCollapseToggle.bind(self)}></i>
                            {label}
                        </span>
                        <div className={"tree-inspect__inner tree-inspect__inner_collapsed_" + (self.state.collapsed ? 'yes' : 'no')}>
                            <TreeInspect data={data}/>
                        </div>
                    </li>
                )
            } else {
                return (
                    <li className="tree-inspect__item">
                        <span className="tree-inspect__label tree-inspect__label_type_primitive">{label}</span>
                        <span className="tree-inspect__value">{"{}"}</span>
                    </li>
                )
            }
        } else {
            var nodes = Object.keys(data).map((node, index) => {
                var value = data[node];
                if (typeof value === 'object') {
                    return (
                        <TreeInspect data={value} label={node}/>
                    )
                } else {
                    return (
                        <li className="tree-inspect__item">
                            <span className="tree-inspect__label tree-inspect__label_type_primitive">{node}</span>
                            <span className="tree-inspect__value">{JSON.stringify(value)}</span>
                        </li>
                    )
                }
            });
            if (nodes.length) {
                return (
                    <ul className="tree-inspect">
                        {nodes}
                    </ul>
                )
            } else {
                return false
            }
        }
    }
}

export default TreeInspect;