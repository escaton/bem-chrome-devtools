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
        var attrs = [];
        var data = this.props.data;
        var iBem = data.iBem;
        var isElem = !!data.elem;
        var jsInited = data.mods.js === 'inited';
        var liveInit = data.liveInit;
        if (iBem) {
            attrs.push(<span className="block__attr">i-bem</span>);
            attrs.push(<span className={"block__attr " + "block__attr_active_" + (jsInited ? 'yes' : 'no')}>{ jsInited ? 'inited' : 'not inited'}</span>);
        }
        if (liveInit) {
            attrs.push(<span className="block__attr">live</span>);
        }
        var name = [<span className="block__name-block">{data.block}</span>];
        if (isElem) {
            name.push(<span className="block__name-elem">__{data.elem}</span>);
        }
        return (
            <div className={"block block_is-elem_" + (isElem ? 'yes' : 'no')}>
                <div className="block__head">
                    <span className="block__name">{name}</span>
                    <span className="block__attrs">{attrs}</span>
                </div>
                <div className="block__title">Mods</div>
                <div className="block__mods">
                    <ModsInspect mods={data.mods} />
                </div>
                <div className="block__title">Params</div>
                <div className="block__params">
                    <TreeInspect data={data.params} />
                </div>
            </div>
        )
    }
}

export default Block;
