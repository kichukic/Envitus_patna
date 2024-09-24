import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export class DarkOverlays extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    popover(hovertext) {
        const popover = (
            <Tooltip>
                {hovertext}
            </Tooltip>
            
        );

        return popover;
    }

    render() {
        return (
            <OverlayTrigger key={1} placement={this.props.placement} overlay={this.popover(this.props.hovertext)}
                delay={{ show: 250, hide: 250 }}
            >
                {this.props.children}
            </OverlayTrigger>
        )
    }
}

export default DarkOverlays
