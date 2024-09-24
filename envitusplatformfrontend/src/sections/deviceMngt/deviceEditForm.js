import React, { Component } from 'react';
import { Form, Button, Modal, Container } from 'react-bootstrap';
import { deviceFormData, deviceFrmValSts } from '../../constants';
import { connect } from 'react-redux';
import { getDeviceSpec, updateDeviceData, addDevice } from '../../services/deviceApi';
import DeviceBasicForm from './deviceBasicForm';
import DeviceDeployForm from './deviceDeployForm';
import DeviceParamForm from './deviceParamForm';
import { intialaizeForm } from '../../action/formAction';
import { copyObjectValues } from '../../utils/index';
import { cloneDeep } from 'lodash';
import {toastr} from 'react-redux-toastr';

export class DeviceEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            updateDeviceId: this.props.updateDeviceId,
        }
        this.props.intialaizeForm({ data: deviceFormData, 
            id: this.props.updateDeviceId, 
            deviceFrmValSts: {...deviceFrmValSts},
            updateType: this.props.updateType
        });
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        if(this.props.updateType === 'update') {
            const formData = copyObjectValues({ ...deviceFormData}, this.props.deviceData);
            formData.paramDefinitions = await this.setParamDefinitions();
            this.props.intialaizeForm({ data: formData, 
                id: this.props.updateDeviceId, 
                deviceFrmValSts: {...deviceFrmValSts},
                updateType: this.props.updateType
            });
        } 
    }

    async setParamDefinitions() {
        const paramDefinitions = await this.props.getDeviceSpec({type: this.props.deviceData.subType});        
        const devicesparamDefinitions = paramDefinitions.map((param) => {
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
                    calibration: cloneDeep(deviceParamValues.calibration) || { type : "curve", data:[] }
                };
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

    async handleSubmit(e) {
        e.preventDefault();
        try {
            let status;
            if(this.props.updateType === 'update') {
                status = await this.props.updateDeviceDetails(this.props.formData.data);
            } else {
                const form = {...this.props.formData.data, ...{
                    activated: true,
                    creationLog : {
                        user: sessionStorage.getItem("whoami"),
                        date: new Date().toISOString()
                    }
                }}
                status = await this.props.addDevice(form);
            }
            if (!status) {
                toastr.error('Oops !!', 'Some Error Occured');
            } else {
                toastr.success('Success !!', 'Device Updated');
            }
        } catch(err) {
            toastr.error('Oops !!', 'Some Error Occured');
        }
        this.props.updateTable(); this.props.handleClose();
    }

    render() {
        let deactBtn = false;
        if(this.props.deviceFrmValSts) {
            deactBtn = Object.keys(this.props.deviceFrmValSts).some(k => {
                if(typeof(this.props.deviceFrmValSts[k]) === 'object') {
                    return Object.keys(this.props.deviceFrmValSts[k]).some(k1 => {
                        return this.props.deviceFrmValSts[k][k1];
                    })
                }
                return this.props.deviceFrmValSts[k];
            })
        }
        
        return (
            <Modal aria-labelledby="contained-modal-title-vcenter" size="xl" scrollable="true"
                show={this.props.show} onHide={this.props.handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add/Update Device Details
                    </Modal.Title>
                </Modal.Header>    
                <Modal.Body>
                    <Container>
                        <Form id="myform" onSubmit={this.handleSubmit}>
                            <DeviceBasicForm deviceData={this.props.deviceData} />
                            <DeviceDeployForm />
                            <DeviceParamForm />
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={deactBtn} form="myform" variant="primary" type="submit">Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return ({
        deviceData: (ownProps.updateDeviceId) ? state.devices.data[ownProps.updateDeviceId] : {},
        formData: state.formData,
        deviceFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        getDeviceSpec: (options) => {
            return dispatch(getDeviceSpec(dispatch, options))
        },
        updateDeviceDetails: (data) => {
            return dispatch(updateDeviceData(dispatch, data))
        },
        addDevice: (data) => {
            return dispatch(addDevice(dispatch, data))
        },
        intialaizeForm: (data) => {
            return dispatch(intialaizeForm(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceEditForm);
