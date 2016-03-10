'use strict';

import React from 'react';
import TreeInspect from '../tree-inspect/tree-inspect.jsx';

class Block extends React.Component {
    render() {
        return (
            <div className="block">
                <span className="block__name">{ this.props.data.name }</span>
                <div className="block__details">
                    <TreeInspect data={this.props.data.params} />
                </div>
            </div>
        )
    }
}

export default Block;