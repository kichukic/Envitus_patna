import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Row, Col } from 'react-bootstrap';
import { updateFormValue, updateFormValidation } from '../../action/formAction'
import { alarmruleClearingMode, alarmruleFrmValRgex, deviceSubTypes } from '../../constants';

export class AlarmruleBasicForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showTimeInterval: false,
        };
        
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        if(e.target.name === 'devType') {
            const info = {...this.props.alarmruleFrmDta.info};
            info[e.target.name] = e.target.value;
            this.props.updateFormValue({info: info});
        } else {
            this.props.updateFormValue({[e.target.name]: e.target.value});
        }
        if(alarmruleFrmValRgex[e.target.name] && !alarmruleFrmValRgex[e.target.name].test(e.target.value)) {
            this.props.updateFormValidation({[e.target.name]: true});
        } else {
            this.props.updateFormValidation({[e.target.name]: false});
        }
    }

    hideTimeInterval(e) {
        if(e.target.value === 'Manual') {
            this.setState({showTimeInterval: false});
        } else {
            this.setState({showTimeInterval: true});
        }
    }

    render() {
        const disableSwitch = (this.props.updateType === 'update') ? true : false;
        return (
            <React.Fragment>
                <Row className="form-sub-heading">
                    <Col sm={12}>
                        <h5>Basic Details</h5>
                        <hr className="my-3 w-100" />
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <Form.Group controlId="ruleName">
                            <Form.Label>Rule Name*</Form.Label>
                            <Form.Control value={this.props.alarmruleFrmDta.ruleName}
                                isInvalid={this.props.alarmruleFrmValSts.ruleName} disabled={disableSwitch}
                                onChange={this.onChange} name="ruleName" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Rule Name</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="devType">
                            <Form.Label>Device Type*</Form.Label>
                            <select value={this.props.alarmruleFrmDta.info.devType} 
                                onChange={(e) => {this.onChange(e); this.props.loadDevice(e)}}
                                name="devType" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {deviceSubTypes.map((subType) => (<option key={subType} value={subType}>
                                    {subType}
                                </option>))}
                            </select>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="clearingMode">
                            <Form.Label>Clearing Mode*</Form.Label>
                            <select value={this.props.alarmruleFrmDta.clearingMode} 
                                onChange={(e) => {this.onChange(e); this.hideTimeInterval(e);}}
                                name="clearingMode" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {alarmruleClearingMode.map((clearingMode) => 
                                    <option key={clearingMode.value} value={clearingMode.value}>
                                        {clearingMode.display}
                                    </option>
                                )}
                            </select>
                        </Form.Group>
                    </Col>
                    {(this.state.showTimeInterval || ((this.props.updateType === 'update') && 
                        (this.props.alarmruleFrmDta.clearingMode === 'Time'))) &&
                        <Col sm={3}>
                            <Form.Group controlId="timeInterval">
                                <Form.Label>Time Interval (seconds)*</Form.Label>
                                <Form.Control value={this.props.alarmruleFrmDta.timeInterval}
                                    isInvalid={this.props.alarmruleFrmValSts.timeInterval}
                                    onChange={this.onChange} name="timeInterval" type="number" required
                                />
                                <Form.Control.Feedback type="invalid">Invalid Time Interval</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    }
                    <Col sm={3}>
                        <Form.Group controlId="message">
                            <Form.Label>Rule Description*</Form.Label>
                            <Form.Control value={this.props.alarmruleFrmDta.message}
                                isInvalid={this.props.alarmruleFrmValSts.message}
                                onChange={this.onChange} name="message" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Rule Description</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return ({
        alarmruleFrmDta: state.formData.data,
        updateType: state.formData.updateType,
        alarmruleFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        updateFormValue: (data) => {
            return dispatch(updateFormValue(data))
        },
        updateFormValidation: (data) => {
            return dispatch(updateFormValidation(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(AlarmruleBasicForm);
