import React, { Component } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

export class Overlays extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    popover(hovertext) {
        const popover = (
            <Popover id="popover-basic">
                <Popover.Title as="h3">{hovertext.head}</Popover.Title>
                <Popover.Content>
                    {hovertext.body}
                </Popover.Content>
            </Popover>
            
        );

        return popover;
    }

    render() {
        return (
            <OverlayTrigger key={1} placement="right" overlay={this.popover(this.props.hovertext)}
                delay={{ show: 250, hide: 250 }}
            >
                {this.props.children}
            </OverlayTrigger>
        )
    }
}

export default Overlays
