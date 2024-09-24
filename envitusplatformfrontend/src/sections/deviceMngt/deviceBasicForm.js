import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { deviceTypes, deviceFamily, deviceSubTypes, deviceFrmValRgex } from '../../constants';
import {timezone} from '../../utils/timeZone';
import { connect } from 'react-redux';
import { getDeviceSpec } from '../../services/deviceApi';
import { updateFormValue, updateFormValidation } from '../../action/formAction';

class DeviceBasicForm extends React.Component {

    constructor(props) {
        super(props);
        
        this.onChange = this.onChange.bind(this);
        this.onChangeSubType = this.onChangeSubType.bind(this);
    }

    onChange(e) {
        this.props.updateFormValue({[e.target.name]: e.target.value});
        if(deviceFrmValRgex[e.target.name] && !deviceFrmValRgex[e.target.name].test(e.target.value)) {
            this.props.updateFormValidation({[e.target.name]: true});
        } else {
            this.props.updateFormValidation({[e.target.name]: false});
        }
    }

    async onChangeSubType(e) {
        const paramDefinitions = await this.setParamDefinitions(e.target.value);
        this.props.updateFormValue({paramDefinitions: paramDefinitions});
    }

    async setParamDefinitions(subType) {
        const paramDefinitions = await this.props.getDeviceSpec({type: subType});
        const devicesparamDefinitions = paramDefinitions.map((param) => {
            if(this.props.updateType === "update") { 
                const deviceParamValues = this.props.deviceData.paramDefinitions.find(function (obj) {
                    return obj.paramName === param.paramName;
                })
                if(deviceParamValues) {
                    return {
                        paramName: param.paramName,
                        displayName: param.displayName,
                        isFilterable: param.isFilterable,
                        filteringMethod: (deviceParamValues.filteringMethod) || "",
                        filteringMethodDef: {...deviceParamValues.filteringMethodDef} || {},
                        maxRanges: {...deviceParamValues.maxRanges} || param.maxRanges,
                        calibration: {...deviceParamValues.calibration} || { type : "curve", data:[] }
                    };
                }
            }    
            
            return {
                paramName: param.paramName,
                displayName: param.displayName,
                isFilterable: param.isFilterable,
                filteringMethod: "",
                filteringMethodDef: {},
                maxRanges: param.maxRanges,
                calibration:  { type : "curve", data:[] }
            }; 
            
        });
        return devicesparamDefinitions;
    }

    render() {
        const disableSwitch = (this.props.updateType === 'update') ? true : false;
        return (
            <React.Fragment>
                <Row className="form-sub-heading">
                    <Col sm={12}><h5>Basic Details</h5></Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <Form.Group controlId="deviceId">
                            <Form.Label>Device Id</Form.Label>
                            <Form.Control value={this.props.devFrmDta.deviceId}
                                isInvalid={this.props.deviceFrmValSts.deviceId} disabled={disableSwitch}
                                onChange={this.onChange} name="deviceId" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid device Id</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="deviceType">
                            <Form.Label>Type</Form.Label>
                            <select value={this.props.devFrmDta.type} onChange={this.onChange}
                                name="type" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {deviceTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="deviceFamily">
                            <Form.Label>Family</Form.Label>
                            <select value={this.props.devFrmDta.devFamily} onChange={this.onChange}
                                name="devFamily" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {deviceFamily.map((family) => (<option key={family} value={family}>
                                    {family}
                                </option>))}
                            </select>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="subType">
                            <Form.Label>SubType</Form.Label>
                            <select value={this.props.devFrmDta.subType} 
                                onChange={e => { this.onChange(e); this.onChangeSubType(e) }}
                                name="subType" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {deviceSubTypes.map((subType) => (<option key={subType} value={subType}>
                                    {subType}
                                </option>))}
                            </select>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="timeZone">
                            <Form.Label>TimeZone</Form.Label>
                            <select value={this.props.devFrmDta.timeZone} onChange={this.onChange}
                                name="timeZone" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {timezone.map((timezones) => (<option key={timezones} value={timezones}>
                                    {timezones}
                                </option>))}
                            </select>
                        </Form.Group>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}



function mapStateToProps(state) {
    return ({
        devFrmDta: state.formData.data,
        updateType: state.formData.updateType,
        deviceFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        getDeviceSpec: (options) => {
            return dispatch(getDeviceSpec(dispatch, options))
        },
        updateFormValue: (data) => {
            return dispatch(updateFormValue(data))
        },
        updateFormValidation: (data) => {
            return dispatch(updateFormValidation(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceBasicForm);
