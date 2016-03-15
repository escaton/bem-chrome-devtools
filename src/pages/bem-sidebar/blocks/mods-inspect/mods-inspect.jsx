'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Mod from './__mod/mods-inspect__mod.jsx';

class ModsInspect extends React.Component {
    constructor(props) {
        super(props);
        var mods = [];
        Object.keys(props.mods).forEach((name) => {
            mods.push({
                name: name,
                value: props.mods[name]
            });
        });
        this.state = {
            mods: mods,
            editable: !this.props.owner.elem
        }
    }
    componentWillReceiveProps(nextProps) {
        var mods = [];
        Object.keys(nextProps.mods).forEach((name) => {
            mods.push({
                name: name,
                value: nextProps.mods[name]
            });
        });
        this.setState({
            mods: mods
        });
    }
    addMod() {
        this.setState((state) => {
            state.newMod = true;
            return state;
        });
    }
    removeMod(modIndex, newMod) {
        this.setState((state) => {
            if (newMod) {
                delete state.newMod;
            } else {
                delete state.mods[modIndex];
            }
            return state;
        });
    }
    render() {
        var self = this;
        var mods = self.state.mods;
        var content;
        var newMod;
        if (mods.length) {
            content = mods.map((mod, modIndex) => {
                return (
                    <Mod key={mod.name + '_' + mod.value} mod={mod} owner={self.props.owner} removeMod={self.removeMod.bind(self, modIndex)}/>
                )
            });
        }
        if (self.state.newMod) {
            newMod = <Mod mod={{}} newMod={true} owner={self.props.owner} removeMod={self.removeMod.bind(self, null, true)}/>
        }
        return (
            <div className="block__mods">
                <div className="block__title">
                    Mods
                    {self.state.editable ? <span className="block__mods-add" onClick={self.addMod.bind(self)}></span> : false}
                </div>
                <ul className="block__mods-list">
                    {content}
                    {newMod}
                </ul>
                <i tabIndex="0" onFocus={self.state.editable ? self.addMod.bind(self) : undefined}></i>
            </div>
        );
    }
}

export default ModsInspect;
