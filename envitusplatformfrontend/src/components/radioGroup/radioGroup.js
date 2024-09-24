import React, { Component } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

class RadioGroup extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const radioItems = this.props.index.map((item) =>
            <ToggleButton variant="outline-success" key={item.value} value={item.value} className="radio-group">
                {item.params}
            </ToggleButton>
        );

        return (
            <div data-test="radioGroup" className="d-flex justify-content-center">
                <ToggleButtonGroup type="checkbox" value={this.props.radioShown} onChange={this.props.radioShownHandleChange}
                    className="pb-sm-3 pb-md-3 radio-group"
                >
                    {radioItems}
                </ToggleButtonGroup>
            </div>
        )
    }
}

export default RadioGroup
