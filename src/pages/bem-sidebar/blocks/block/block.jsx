'use strict';

import React from 'react';
import TreeInspect from '../tree-inspect/tree-inspect.jsx';

class ModsInspect extends React.Component {
    render() {
        var mods = this.props.mods;
        var modNames = Object.keys(mods);
        var content;
        if (modNames.length) {
            content = modNames.map((modName) => {
                return (
                    <li className="block__mod">
                        <span className="block__mod-name">{modName}</span>
                        <span className="block__mod-val">{mods[modName]}</span>
                    </li>
                );
            });
        }
        return (
            <ul className="block__mods-list">
                {content}
            </ul>
        );
    }
}

class Block extends React.Component {
    render() {
        return (
            <div className="block">
                <span className="block__name">{this.props.data.name}</span>
                <div className="block__title">Mods</div>
                <div className="block__mods">
                    <ModsInspect mods={this.props.data.params.mods} />
                </div>
                <div className="block__title">Params</div>
                <div className="block__params">
                    <TreeInspect data={this.props.data.params.params} />
                </div>
            </div>
        )
    }
}

export default Block;
