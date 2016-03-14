'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

class Mod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            originalMod: Object.assign({}, props.mod),
            mod: Object.assign({}, props.mod),
            fresh: !props.mod.name,
            edit: !props.mod.name && 'name',
            editable: !props.owner.elem // TEMPORARY
        }
    }
    componentWillReceiveProps(nextProps) {
        var self = this;
        self.setState({
            originalMod: Object.assign({}, nextProps.mod),
            mod: Object.assign({}, nextProps.mod),
            fresh: false
        });
    }
    labelFocus(fieldName, e) {
        var self = this;
        self.setState({
            edit: fieldName
        });
        e.preventDefault();
    }
    modFocus(e) {
        e.target.select();
    }
    checkChanges() {
        var self = this;
        return self.state.mod.name !== self.state.originalMod.name
            || self.state.mod.value !== self.state.originalMod.value;
    }
    commit(cmd, originalMod) {
        var self = this;
        window.postMessage({
            cmd: 'mod-' + cmd,
            owner: self.props.owner,
            mod: Object.assign({}, self.state.mod),
            originalMod: originalMod && Object.assign({}, self.state.originalMod)
        }, '*');
    }
    modBlur(fieldName, e) {
        var self = this;
        var originalValue = self.state.originalMod[fieldName];
        var value = self.state.mod[fieldName];
        self.setState({
            edit: undefined
        });
        if (self.state.fresh) {
            if (!value) {
                self.props.removeMod();
            } else if (fieldName === 'value' && self.checkChanges()) {
                self.commit('add');
            }
        } else {
            if (!value) {
                self.props.removeMod();
                self.commit('remove', true);
            } else if (fieldName === 'value' && self.checkChanges()) {
                self.commit('add', true);
            }
        }
    }
    modKeyDown(e) {
        var self = this;
        var key = e.keyCode;
        switch (e.key) {
            case 'Escape':
                // self.props.onChange();
                break;
            case 'Enter':
                var keyboardEvent = new KeyboardEvent('keydown', {
                    code: 'Tab',
                    keyCode: 9,
                    keyIdentifier: 'U+0009',
                    which: 9
                });
                e.target.dispatchEvent(keyboardEvent);
                break;
        }
    }
    modChange(fieldName, e) {
        var self = this;
        var value = e.target.value;
        if (/^[a-zA-Z0-9-]+$/.test(value)) {
            self.setState((state) => {
                state.mod[fieldName] = value;
                return state;
            });
        } else if (value === '') {
            self.setState((state) => {
                state.mod[fieldName] = undefined;
                return state;
            });
        }
    }
    render() {
        var self = this;
        var mod = self.state.mod;
        var fields = ['name', 'value'].map((fieldName) => {
            if (self.state.edit === fieldName) {
                return <input
                    key="edit"
                    className="block__mod-edit"
                    value={mod[fieldName]}
                    readOnly={!self.state.editable}
                    onChange={self.modChange.bind(self, fieldName)}
                    autoFocus={true}
                    onKeyDown={self.modKeyDown.bind(self)}
                    onFocus={self.modFocus.bind(self)}
                    onBlur={self.modBlur.bind(self, fieldName)}
                />
            } else {
                return <span
                    key={"view-" + fieldName}
                    tabIndex="0"
                    onFocus={self.labelFocus.bind(self, fieldName)}
                    className={"block__mod-" + fieldName}
                >{mod[fieldName]}</span>
            }
        });
        return (
            <li className="block__mod">
                {fields}
            </li>
        );
    }
}

export default Mod;
