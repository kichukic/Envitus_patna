import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { deviceGrade, deviceDeployment, deviceFrmValRgex } from '../../constants';
import { connect } from 'react-redux';
import Sensor from '../../components/sensor/sensor';
import { updateFormValue, updateFormValidation } from '../../action/formAction';

class DeviceDeployForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            top: 0 + '%',
            left: 0 + '%',
            slot: "slot",
            position: "0 0 0.5",
            normal: "0 0 1",
        };
        
        this.onChange = this.onChange.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.devFrmDta.location.latitude !== this.props.devFrmDta.location.latitude ||
            prevProps.devFrmDta.location.longitude !== this.props.devFrmDta.location.longitude) {
            this.updateSensorStyle();
        }
    }

    onChange(e) {
        this.props.updateFormValue({[e.target.name]: e.target.value});
        if(deviceFrmValRgex[e.target.name] && !deviceFrmValRgex[e.target.name].test(e.target.value)) {
            this.props.updateFormValidation({[e.target.name]: true});
        } else {
            this.props.updateFormValidation({[e.target.name]: false});
        }
    }

    onLocationChange(e) {
        const location = {...this.props.devFrmDta.location};
        location[e.target.name] = e.target.value
        this.props.updateFormValue({location: location});

        const locationValid = {...this.props.deviceFrmValSts.location};
        locationValid[e.target.name] = e.target.value
        if(deviceFrmValRgex.location[e.target.name] && 
            !deviceFrmValRgex.location[e.target.name].test(e.target.value)) {
            locationValid[e.target.name] = true;
            this.props.updateFormValidation({location: locationValid});
        } else {
            locationValid[e.target.name] = false;
            this.props.updateFormValidation({location: locationValid});
        }

        this.updateSensorStyle();
    }

    updateSensorStyle(){
        this.setState({
            sensorStyle: {
                top: this.props.devFrmDta.location.latitude + '%',
                left: this.props.devFrmDta.location.longitude + '%',
                slot: this.props.devFrmDta.location.slot,
                position: this.props.devFrmDta.location.dataPosition,
                normal: this.props.devFrmDta.location.dataNormal,
            }
        });
    }

    render() {
        return (
            <React.Fragment>
                <Row className="form-sub-heading">
                    <Col sm={12}><h5>Deployment Details</h5></Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <Form.Group controlId="customerName">
                            <Form.Label>Customer Name</Form.Label>
                            <Form.Control value={this.props.devFrmDta.customerName} 
                                isInvalid={this.props.deviceFrmValSts.customerName}
                                onChange={this.onChange} name="customerName" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">
                                Invalid customer Name
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="lotNo">
                            <Form.Label>Lot No</Form.Label>
                            <Form.Control value={this.props.devFrmDta.lotNo} onChange={this.onChange}
                                isInvalid={this.props.deviceFrmValSts.lotNo} 
                                name="lotNo" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Lot No</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="serialNo">
                            <Form.Label>Serial No</Form.Label>
                            <Form.Control value={this.props.devFrmDta.serialNo}
                                isInvalid={this.props.deviceFrmValSts.serialNo}
                                onChange={this.onChange} name="serialNo" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid serial No</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="grade">
                            <Form.Label>Grade</Form.Label>
                            <select value={this.props.devFrmDta.grade} onChange={this.onChange}
                                name="grade" className="form-control"
                            >
                                <option hidden value="">None</option>
                                {deviceGrade.map((grade) => (<option key={grade} value={grade}>
                                    {grade}
                                </option>))}
                            </select>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <Form.Group controlId="grade">
                            <Form.Label>Deployment</Form.Label>
                            <select value={this.props.devFrmDta.deployment} onChange={this.onChange}
                                name="deployment" className="form-control" required
                            >
                                <option hidden value="">None</option>
                                {deviceDeployment.map((deploy) => (<option key={deploy} value={deploy}>
                                    {deploy}
                                </option>))}
                            </select>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="locId">
                            <Form.Label>Location ID</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.locId}
                                isInvalid={this.props.deviceFrmValSts.location.locId}
                                onChange={this.onLocationChange} name="locId" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Location ID</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="city">
                            <Form.Label>City</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.city}
                                isInvalid={this.props.deviceFrmValSts.location.city}
                                onChange={this.onLocationChange} name="city" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid City</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="zone">
                            <Form.Label>Zone</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.zone}
                                isInvalid={this.props.deviceFrmValSts.location.zone}
                                onChange={this.onLocationChange} name="zone" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Zone</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="landMark">
                            <Form.Label>LandMark</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.landMark}
                                isInvalid={this.props.deviceFrmValSts.location.landMark}
                                onChange={this.onLocationChange} name="landMark" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid LandMark</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="latitude">
                            <Form.Label>Latitude</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.latitude}
                                isInvalid={this.props.deviceFrmValSts.location.latitude}
                                onChange={this.onLocationChange} name="latitude" 
                                type="number" step="0.01" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid latitude</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="longitude">
                            <Form.Label>Longitude</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.longitude}
                                isInvalid={this.props.deviceFrmValSts.location.longitude}
                                onChange={this.onLocationChange} name="longitude" 
                                type="number" step="0.01" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid longitude</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {(process.env.REACT_APP_DASHBOARD_TYPE === 'dashboard3D') &&
                        <span>
                            <Col sm={3}>
                                <Form.Group controlId="slot">
                                    <Form.Label>Slot</Form.Label>
                                    <Form.Control value={this.props.devFrmDta.location.slot}
                                        isInvalid={this.props.deviceFrmValSts.location.slot}
                                        onChange={this.onLocationChange} name="slot" 
                                        type="text" required
                                    />
                                    <Form.Control.Feedback type="invalid">Invalid slot</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={3}>
                                <Form.Group controlId="dataPosition">
                                    <Form.Label>Data Position</Form.Label>
                                    <Form.Control value={this.props.devFrmDta.location.dataPosition}
                                        isInvalid={this.props.deviceFrmValSts.location.dataPosition}
                                        onChange={this.onLocationChange} name="dataPosition" 
                                        type="text" required
                                    />
                                    <Form.Control.Feedback type="invalid">Invalid dataPosition</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col sm={3}>
                                <Form.Group controlId="dataNormal">
                                    <Form.Label>Data Normal</Form.Label>
                                    <Form.Control value={this.props.devFrmDta.location.dataNormal}
                                        isInvalid={this.props.deviceFrmValSts.location.dataNormal}
                                        onChange={this.onLocationChange} name="dataNormal" 
                                        type="text" required
                                    />
                                    <Form.Control.Feedback type="invalid">Invalid dataNormal</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </span>
                    }
                    <Col sm={3}>
                        <Form.Group controlId="building">
                            <Form.Label>Building</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.building}
                                onChange={this.onLocationChange} name="building" type="text"
                            />
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="floor">
                            <Form.Label>Floor</Form.Label>
                            <Form.Control value={this.props.devFrmDta.location.floor}
                                onChange={this.onLocationChange} name="floor" type="text"
                            />
                        </Form.Group>
                    </Col>
                    {(process.env.REACT_APP_DASHBOARD_TYPE === 'dashboard') && 
                        <Col className="buildImage mx-auto" sm={6}>
                            <img className="d-block"
                                src={process.env.PUBLIC_URL + "/img/building1.jpg"}
                                alt="building"
                                width="400"
                            />
                            <Sensor mode="circle" positionStyle={this.state.sensorStyle}/>
                        </Col>
                    }
                    {(process.env.REACT_APP_DASHBOARD_TYPE === 'dashboard3D') && 
                        <Col className="buildImage mx-auto" sm={6}>
                            <model-viewer src={process.env.PUBLIC_URL + "/img/astronaut.glb"} 
                                alt="building" className="d-block mx-auto" auto-rotate camera-controls
                                style={{width: "100%"}}
                            >
                                {this.state.sensorStyle && 
                                     <Sensor mode="circle3D" positionStyle={this.state.sensorStyle} />
                                }
                            </model-viewer>
                        </Col>
                    }
                </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(DeviceDeployForm);
