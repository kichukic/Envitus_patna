import React, { Component } from 'react';
import { Form } from 'react-bootstrap';

export class FormSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const dropItems = this.props.index.map((item) =>
            <option variant="success" key={item.value} value={item.value}>
                {item.params}
            </option>
        );

        return (
            <Form.Control data-test="selForm" as="select" style={this.props.style}
                value={this.props.selectValue} onChange={this.props.selectValueHandleChange}
            >
                {dropItems}
            </Form.Control>
        )
    }
}

export default FormSelect
