'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

class Mod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mod: Object.assign({}, props.mod),
            edit: props.newMod && 'name'
        }
    }
    componentWillReceiveProps(nextProps) {
        var self = this;
        self.setState((state) => {
            state.mod = Object.assign({}, nextProps.mod);
            if (nextProps.newMod) {
                state.edit = 'name'
            }
            return state;
        });
    }
    componentDidUpdate() {
        var self = this;
        // sometimes lose focus because of react change tree
        if (self.state.edit) {
            var input = ReactDOM.findDOMNode(self.refs.input);
            if (input !== document.activeElement) {
                input.focus();
            }
        }
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
        return self.state.mod.name !== self.props.mod.name
            || self.state.mod.value !== self.props.mod.value;
    }
    checkValid() {
        var self = this;
        // Both are strings, so even "0" is valid
        return self.state.mod.name && self.state.mod.value;
    }
    commit(cmd) {
        var self = this;
        window.postMessage({
            cmd: 'mod-' + cmd,
            owner: self.props.owner,
            mod: Object.assign({}, self.state.mod),
            originalMod: !self.props.newMod && Object.assign({}, self.props.mod)
        }, '*');
    }
    modBlur(fieldName, e) {
        var self = this;
        var originalValue = self.props.mod[fieldName];
        var value = self.state.mod[fieldName];
        self.setState({
            edit: undefined
        });
        if (!value) {
            self.props.removeMod();
            !self.props.newMod && self.commit('remove');
        } else if (self.checkChanges()) {
            var span = ReactDOM.findDOMNode(self.refs.span);
            if (span !== e.relatedTarget) {
                if (self.checkValid()) {
                    self.commit('add');
                } else {
                    self.props.removeMod();
                    !self.props.newMod && self.commit('remove');
                }
            }
        }
    }
    modKeyDown(e) {
        var self = this;
        var key = e.keyCode;
        switch (e.key) {
            // case 'Escape':
            //     e.preventDefault();
            //     e.stopPropagation();
            //     // self.props.onChange();
            //     break;
            case 'Enter':
                var keyboardEvent = new KeyboardEvent('keydown', {
                    code: 'Tab',
                    keyCode: 9,
                    keyIdentifier: 'U+0009',
                    which: 9
                });
                e.preventDefault();
                e.stopPropagation();
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
                    ref="input"
                    className="block__mod-edit"
                    value={mod[fieldName]}
                    onChange={self.modChange.bind(self, fieldName)}
                    autoFocus={true}
                    onKeyDown={self.modKeyDown.bind(self)}
                    onFocus={self.modFocus.bind(self)}
                    onBlur={self.modBlur.bind(self, fieldName)}
                />
            } else {
                return <span
                    ref="span"
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
