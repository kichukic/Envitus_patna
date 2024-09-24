import React, { Component } from 'react';
import { Button, Form } from 'react-bootstrap';

export class FormDate extends Component {
    render() {
        return (
            <Form data-test="dateForm" className={this.props.dateClass}>
                <label>
                    From &nbsp;
                    <input type="date" onChange={this.props.dateInputChange} name="startDate" />
                    &nbsp;&nbsp;&nbsp;
                </label>
                
                <label>
                    To &nbsp;
                    <input type="date" onChange={this.props.dateInputChange} name="endDate" />
                </label>
                <Button className={this.props.dateClass} onClick={this.props.dateSubmit} variant="success" style={{marginLeft:7}}>
                    Submit
                </Button>
            </Form>
        )
    }
}

export default FormDate
