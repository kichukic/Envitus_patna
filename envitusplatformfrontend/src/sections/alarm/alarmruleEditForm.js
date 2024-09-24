import React, { Component } from 'react';
import { Form, Button, Modal, Container } from 'react-bootstrap';
import AlertBox from '../../components/alertBox/alertBox';
import { connect } from 'react-redux';
import { alarmruleFormData, alarmruleFrmValSts } from '../../constants';
import { intialaizeForm } from '../../action/formAction';
import { addAlarmrule, updateAlarmrule } from '../../services/alarmApi';
import { getDeviceCount, getDeviceDetails } from '../../services/deviceApi';
import AlarmruleBasicForm from './alarmruleBasicForm';
import AlarmruleDeviceForm from './alarmruleDeviceForm';
import AlarmruleDeviceParamDefForm from './alarmruleDeviceParamDefForm'
import { copyObjectValues } from '../../utils/index';
import { filter } from 'lodash'

export class AlarmruleEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            updateAlarmruleId: this.props.updateAlarmruleId,
            showWarning: false,
            warningType: '',
            warningMsg: '',
            allDevices: [],
            paramDef: [],
        }
        this.props.intialaizeForm({ data: alarmruleFormData, 
            id: this.props.updateAlarmruleId, 
            deviceFrmValSts: {...alarmruleFrmValSts},
            updateType: this.props.updateType
        });
        this.handleSubmit = this.handleSubmit.bind(this);
        this.loadDevice = this.loadDevice.bind(this);
    }

    async componentDidMount() {
        if(this.props.updateType === 'update') {
            const selectedAlarmruleData = filter(this.props.alarmruleData, {ruleName: this.props.updateAlarmruleId});
            const formData = copyObjectValues({ ...alarmruleFormData}, selectedAlarmruleData[0]);
            this.props.intialaizeForm({ data: formData, 
                id: this.props.updateAlarmruleId, 
                deviceFrmValSts: {...alarmruleFrmValSts},
                updateType: this.props.updateType
            });
            this.loadDevice(formData.info.devType);
        } 
    }

    async handleSubmit(e) {
        e.preventDefault();
        try {
            const paramDefs = {...this.props.formData.data.info.paramDefs};
            Object.keys(paramDefs).forEach((key, index) => {
                if((paramDefs[key].displayName === "") || (paramDefs[key].minLimit === "") ||
                    (paramDefs[key].maxLimit === "")){
                    delete paramDefs[key]
                }
            })
            this.props.formData.data.info.paramDefs = paramDefs;
            this.props.formData.data.type = 'device';

            if(this.props.updateType === 'update') {
                this.props.formData.data['updateAlarmruleId'] = this.props.updateAlarmruleId
            }
            const status = (this.props.updateType === 'update') ? 
                await this.props.updateAlarmrule(this.props.formData.data) :
                await this.props.addAlarmrule(this.props.formData.data);
            if (!status) {
                this.setState({
                    showWarning: true,
                    warningType: 'warning',
                    warningMsg: 'Some error Occured'
                });
            } else {
                this.setState({
                    showWarning: true,
                    warningType: 'success',
                    warningMsg: 'Alarm Rule updated successfully'
                });
            }
        } catch(err) {
            this.setState({
                showWarning: true,
                warningType: 'danger',
                warningMsg: 'Some error Occured'
            });
        }
    }

    async loadDevice(e) {
        let subTyp;
        if(e.target) {
            e.preventDefault();
            subTyp = e.target.value;
        } else {
            subTyp = e;
        }
        
        const option = {deviceId: 'null', zone: 'null', city: 'null', subType: 'null', activated: 'null'}
        const count = await this.props.getDeviceCount(option); const subTypDev = [];

        for (let i = 0; i < count; i++) {
            const dev = await this.props.getDeviceDetails(i);
            if(dev.activated && (dev.subType === subTyp)) {
                subTypDev.push(dev)
            }
        }

        this.setState({allDevices: subTypDev, paramDef: subTypDev[0].paramDefinitions})
    }

    async loadFormVals () {

    }

    render() {
        let deactBtn = false;
        if(this.props.alarmruleFrmValSts) {
            deactBtn = Object.keys(this.props.alarmruleFrmValSts).some(k => {
                return this.props.alarmruleFrmValSts[k];
            })
        }

        return (
            <Modal aria-labelledby="contained-modal-title-vcenter"
                size="xl"
                scrollable="true"
                show={this.props.show} 
                onHide={this.props.handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add/Update Alarm Rule
                    </Modal.Title>
                </Modal.Header>    
                <Modal.Body>
                    <Container>
                        <Form id="myform" onSubmit={this.handleSubmit}>
                            <AlarmruleBasicForm loadDevice={this.loadDevice} 
                                updateType={this.props.updateType}
                            />
                            <AlarmruleDeviceForm allDevices={this.state.allDevices}/>
                            <AlarmruleDeviceParamDefForm paramDef={this.state.paramDef}
                                updateType={this.props.updateType}
                            />
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <AlertBox show={this.state.showWarning}
                        variant={this.state.warningType}
                        text={this.state.warningMsg}
                    />
                    <Button disabled={deactBtn} form="myform" variant="primary" type="submit">Save</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return ({
        alarmruleData: (ownProps.updateAlarmruleId) ? state.alarmData.data : {},
        formData: state.formData,
        alarmruleFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        intialaizeForm: (data) => {
            return dispatch(intialaizeForm(data))
        },
        addAlarmrule: (data) => {
            return dispatch(addAlarmrule(dispatch, data))
        },
        updateAlarmrule: (data) => {
            return dispatch(updateAlarmrule(dispatch, data))
        }, 
        getDeviceCount: (option) => {
            return dispatch(getDeviceCount(dispatch, option))
        },
        getDeviceDetails: (id) => {
            return dispatch(getDeviceDetails(dispatch, id))
        },   
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(AlarmruleEditForm);
