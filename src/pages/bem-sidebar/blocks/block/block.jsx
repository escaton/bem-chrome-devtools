'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import TreeInspect from '../tree-inspect/tree-inspect.jsx';
import ModsInspect from '../mods-inspect/mods-inspect.jsx';

class ParamsInspect extends React.Component {
    render() {
        return (
            <div className="block__params">
                <div className="block__title">Params</div>
                <div className="block__params-inspect">
                    <TreeInspect data={this.props.params} />
                </div>
            </div>
        )
    }
}

class Block extends React.Component {
    inspectParent() {
        var self = this;
        window.postMessage({
            cmd: 'inspect-parent',
            block: self.props.data.block,
            elem: self.props.data.elem
        }, '*');
    }
    render() {
        var self = this;
        var data = this.props.data;
        var iBem = data.iBem;
        var isElem = !!data.elem;
        var hasParent = !!data.parent;
        var jsInited = data.mods.js === 'inited';
        var liveInit = data.liveInit;
        var attrs = [];
        if (iBem) {
            attrs.push(<span key="label-i-bem" className="block__attr">i-bem</span>);
            attrs.push(<span key="label-js-inited" className={"block__attr " + "block__attr_active_" + (jsInited ? 'yes' : 'no')}>{ jsInited ? 'inited' : 'not inited'}</span>);
        }
        if (liveInit) {
            attrs.push(<span key="label-live" className="block__attr">live</span>);
        }
        var name = [<span key="block-name" className="block__name-block">{data.block}</span>];
        if (isElem) {
            if (hasParent) {
                name = [
                    <span
                        onClick={self.inspectParent.bind(self)}
                        key="block-name"
                        className="block__name-block block__attr"
                        title={data.parent.tag.toLowerCase()+'.'+data.parent.class}
                    >{data.block}</span>
                ];
            }
            name.push(<span key="block-elem" className="block__name-elem">__{data.elem}</span>);
        }
        return (
            <div className={"block block_is-elem_" + (isElem ? 'yes' : 'no')}>
                <div className="block__head">
                    <span className="block__name">{name}</span>
                    <span className="block__attrs">{attrs}</span>
                </div>
                <ModsInspect owner={{block: data.block, elem: data.elem}} mods={data.mods}/>
                <ParamsInspect params={data.params} />
            </div>
        )
    }
}

export default Block;
