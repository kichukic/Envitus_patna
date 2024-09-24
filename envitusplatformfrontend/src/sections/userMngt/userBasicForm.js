import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { userRoles, userFrmValRgex } from '../../constants';
import { connect } from 'react-redux';
import { updateFormValue, updateFormValidation } from '../../action/formAction';
import { getDeviceCount, getDeviceDetails } from '../../services/deviceApi';
import Select from 'react-select';
import { find } from 'lodash'; 

class UserBasicForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deviceOptions: ''
        }
        
        this.handleChange = this.handleChange.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    async componentDidMount() {
        const option = {deviceId: 'null', zone: 'null', city: 'null', subType: 'null', activated: 'null'}
        const count = await this.props.getDeviceCount(option);
        this.loadDevices(count);
    }

    handleChange(keyVal, action) {
        if(action.action === 'clear') {
            this.props.updateFormValue({[action.name]: ""});
        } else if(action.name === 'devices') {
            const userDev = (keyVal !== null) ? keyVal.map(dev => {return dev.value}) : ""
            this.props.updateFormValue({[action.name]: userDev});
        } else {
            this.props.updateFormValue({[action.name]: keyVal.value});
        }
    }

    onChange(e) {
        this.props.updateFormValue({[e.target.name]: e.target.value});
        if(userFrmValRgex[e.target.name] && !userFrmValRgex[e.target.name].test(e.target.value)) {
            this.props.updateFormValidation({[e.target.name]: true});
        } else {
            this.props.updateFormValidation({[e.target.name]: false});
        }
    }

    async loadDevices(count) {
        this.setState({deviceOptions: [{label: 'Loading', value: 'Loading'}]})
        const devices = [];
        for (let i = 0; i < count; i++) {
            const sensorData = await this.props.getDeviceDetails(i);
            if(sensorData.activated) {
                devices.push({label: sensorData.location.landMark, value: sensorData.deviceId})
            }
        }
        this.setState({deviceOptions: devices})
    }

    render() {
        const roleValue = find(userRoles, ['value', this.props.userFrmDta.role]);
        const deviceValue = ((this.props.userFrmDta.devices !== null) && (this.props.userFrmDta.devices !== "")) ? 
            this.props.userFrmDta.devices.map(dev => {
                return find(this.state.deviceOptions, ['value', dev])
            }) : "";
        const disableSwitch = (this.props.updateType === 'update') ? true : false;
        const isSearchable = true; const isMulti = true; const isClearable = true;
        return (
            <React.Fragment>
                <Row className="form-sub-heading">
                    <Col sm={12}><h5>Basic Details</h5></Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <Form.Group controlId="userName">
                            <Form.Label>Username</Form.Label>
                            <Form.Control value={this.props.userFrmDta.userName}
                                isInvalid={this.props.userFrmValSts.userName} disabled={disableSwitch}
                                onChange={this.onChange} name="userName" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Username</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="name">
                            <Form.Label>Name*</Form.Label>
                            <Form.Control value={this.props.userFrmDta.name}
                                isInvalid={this.props.userFrmValSts.name}
                                onChange={this.onChange} name="name" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Name</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="role">
                            <Form.Label>Role*</Form.Label>
                            <React.Fragment>
                                <Select options={userRoles} onChange={this.handleChange} value={roleValue}
                                    name="role" isSearchable={isSearchable} isClearable={isClearable}
                                />                                    
                                <input tabIndex={-1} autoComplete="off" style={{ opacity: 0, height: 0 }}
                                    value={this.props.userFrmDta.role} onChange={() => {}} required
                                />
                            </React.Fragment>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="email">
                            <Form.Label>Email*</Form.Label>
                            <Form.Control value={this.props.userFrmDta.email}
                                isInvalid={this.props.userFrmValSts.email}
                                onChange={this.onChange} name="email" type="email" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Email</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="contact">
                            <Form.Label>Contact*</Form.Label>
                            <Form.Control value={this.props.userFrmDta.contact}
                                isInvalid={this.props.userFrmValSts.contact}
                                onChange={this.onChange} name="contact" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Contact</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="password">
                            <Form.Label>Password*</Form.Label>
                            <Form.Control value={this.props.userFrmDta.password}
                                isInvalid={this.props.userFrmValSts.password}
                                onChange={this.onChange} name="password" type="password" required
                            />
                            <Form.Control.Feedback type="invalid">
                                Invalid Password !! Should be atleast 8 in length and should contain atleast 1 alphabet and a number
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="devices">
                            <Form.Label>Devices*</Form.Label>
                            <React.Fragment>
                                <Select options={this.state.deviceOptions} onChange={this.handleChange}
                                    name="devices" isSearchable={isSearchable} isClearable={isClearable}
                                    isMulti={isMulti} value={deviceValue}
                                />                                    
                                <input tabIndex={-1} autoComplete="off" style={{ opacity: 0, height: 0 }}
                                    value={String(this.props.userFrmDta.devices)} onChange={() => {}} required
                                />
                            </React.Fragment>
                        </Form.Group>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}



function mapStateToProps(state) {
    return ({
        userFrmDta: state.formData.data,
        updateType: state.formData.updateType,
        userFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        updateFormValue: (data) => {
            return dispatch(updateFormValue(data))
        },
        updateFormValidation: (data) => {
            return dispatch(updateFormValidation(data))
        },
        getDeviceCount: (option) => {
            return dispatch(getDeviceCount(dispatch, option))
        },
        getDeviceDetails: (id) => {
            return dispatch(getDeviceDetails(dispatch, id))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(UserBasicForm);
