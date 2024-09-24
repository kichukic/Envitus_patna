import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { deviceCalbFunc, deviceFilter, calibrationValues } from '../../constants';
import './deviceMngt.scss';
import { connect } from 'react-redux';
import { updateFormValue, updateFormValidation } from '../../action/formAction'
import { MdAddCircleOutline, MdRemoveCircleOutline } from "react-icons/md";

class DeviceParamForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            top: 0 + '%',
            left: 0 + '%',
        };
        
        this.onChangeFilterMethod = this.onChangeFilterMethod.bind(this);
        this.onChangeRanges = this.onChangeRanges.bind(this);
        this.onChangeFilterMethodDef = this.onChangeFilterMethodDef.bind(this);
        this.onChangeCalibration = this.onChangeCalibration.bind(this);
        this.addCalibration = this.addCalibration.bind(this);
        this.RemoveWMA = this.RemoveWMA.bind(this);
        this.RemoveFilter = this.RemoveFilter.bind(this);
    }

    onChangeFilterMethod(e, index) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].filteringMethod = e.target.value
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    onChangeRanges(e, index, key) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].maxRanges[key] = Number(e.target.value);
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    onChangeFilterMethodDef(e, index) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].filteringMethodDef[e.target.name] = e.target.value;
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    onChangeCalibration(e, index, calbIndex) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].calibration.data[calbIndex][e.target.name] = e.target.value;
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    addCalibration(index) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].calibration.data.push({...calibrationValues});
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    RemoveWMA(index) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].filteringMethod = "";
        formData.paramDefinitions[index].filteringMethodDef = {};
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    RemoveFilter(index) {
        const formData = {...this.props.devFrmDta}
        formData.paramDefinitions[index].calibration.data = [];
        this.props.updateFormValue({paramDefinitions: formData.paramDefinitions});
    }

    render() {
        return (
            <React.Fragment>
                <Row className="form-sub-heading">
                    <Col sm={12}><h5>Device Parameter Setting</h5></Col>
                </Row>
                {this.props.devFrmDta.paramDefinitions.map( (param, index) => {
                    return ((param.isFilterable) &&
                        <div key={param.paramName}>
                            <Row>
                                <Col sm={2}><h6>{param.displayName}</h6></Col>
                                <Col sm={3}>
                                    Filtering<MdRemoveCircleOutline onClick={() => this.RemoveWMA(index)} />
                                </Col>
                                <Col sm={2}>Range</Col>
                                <Col sm={5}>
                                    Calibration<MdAddCircleOutline onClick={() => this.addCalibration(index)} />
                                    <MdRemoveCircleOutline onClick={() => this.RemoveFilter(index)} />
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={2}>{}</Col>
                                <Col sm={3}>{}</Col>
                                <Col sm={2}><Form.Label>Min Value</Form.Label></Col>
                                <Col sm={5}>
                                    <Row>
                                        <Col sm={3}>Min</Col>
                                        <Col sm={3}>Max</Col>
                                        <Col sm={3}>offset</Col>
                                        <Col sm={3}>Func</Col>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col sm={2}>{}</Col>
                                <Col sm={3}>
                                    <Form.Group controlId="filteringMethod">
                                        <select value={param.filteringMethod} 
                                            onChange={(e) => this.onChangeFilterMethod(e, index)}
                                            name="filteringMethod" className="form-control"
                                        >
                                            <option hidden value="">None</option>
                                            {deviceFilter.map((filter) => (<option key={filter} value={filter}>
                                                {filter}
                                            </option>))}
                                        </select>
                                    </Form.Group>
                                </Col>
                                <Col sm={2}>
                                    <Form.Group controlId="rangeMin">
                                        <Form.Control value={param.maxRanges["min"]}
                                            onChange={(e) => this.onChangeRanges(e, index, "min")}
                                            name="rangeMin" type="number"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={5}>{
                                    param.calibration["data"].map( (data, calbIndex) => {
                                        return (
                                            <Row key={calbIndex}>
                                                <Col sm={3}>
                                                    <Form.Group controlId="min">
                                                        <Form.Control 
                                                            value={data.min}
                                                            onChange={(e) => this.
                                                                onChangeCalibration(e, index, calbIndex)} 
                                                            name="min" type="number"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group controlId="max">
                                                        <Form.Control 
                                                            value={data.max}
                                                            onChange={(e) => this.
                                                                onChangeCalibration(e, index, calbIndex)}
                                                            name="max" type="number"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group controlId="offset">
                                                        <Form.Control 
                                                            value={data.offset}
                                                            onChange={(e) => this.
                                                                onChangeCalibration(e, index, calbIndex)}
                                                            name="offset" type="number"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col sm={3}>
                                                    <Form.Group controlId="funct">
                                                        <select value={data.funct} 
                                                            onChange={(e) => this.
                                                                onChangeCalibration(e, index, calbIndex)}
                                                            name="funct" className="form-control"
                                                        >
                                                            <option hidden value="">None</option>
                                                            {deviceCalbFunc.map((funct) => (
                                                                <option key={funct} value={funct}>{funct}</option>
                                                            ))}
                                                        </select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        )
                                    })
                                }</Col>
                            </Row>
                            <Row>
                                <Col sm={2}>{}</Col>
                                <Col sm={3}>
                                    <Form.Group controlId="weightT0">
                                        <Form.Label>weightT0</Form.Label>
                                        <Form.Control 
                                            value={param.filteringMethodDef["weightT0"]}
                                            onChange={(e) => this.onChangeFilterMethodDef(e, index)}
                                            name="weightT0" type="number"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={2}>
                                    <Form.Group controlId="rangeMax">
                                        <Form.Label>Max Value</Form.Label>
                                        <Form.Control value={param.maxRanges["max"]}
                                            onChange={(e) => this.onChangeRanges(e, index, "max")} 
                                            name="rangeMax" type="number" required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={5}>{}</Col>
                            </Row>
                            <Row>
                                <Col sm={2}>{}</Col>
                                <Col sm={3}>
                                    <Form.Group controlId="weightT1">
                                        <Form.Label>weightT1</Form.Label>
                                        <Form.Control 
                                            value={param.filteringMethodDef["weightT1"]}
                                            onChange={(e) => this.onChangeFilterMethodDef(e, index)} 
                                            name="weightT1" type="number"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col sm={2}>{}</Col>
                                <Col sm={5}>{}</Col>
                            </Row>
                            <hr />
                        </div>
                    )
                })}
            </React.Fragment>
        );
    }
}


function mapStateToProps(state) {
    return ({
        devFrmDta: state.formData.data,
        deviceFrmValSts: state.formData.deviceFrmValSts
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

export default connect(mapStateToProps, mapDispatchToProps)(DeviceParamForm);
