import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import GoogleMap from '../../components/googleMap/googleMap';
import DataStats from './dataStats';
import UserAssign from './userAssign';
import { updateSelectedDevice } from '../../action/deviceAction';
import { connect } from 'react-redux';
import { getDeviceCount, getDeviceDetails } from '../../services/deviceApi';
import Sensor from '../../components/sensor/sensor';
import { getDeviceSpec } from '../../services/deviceApi';
import { getAllDeviceData } from '../../services/liveDataApi';
import RadioGroup from '../../components/radioGroup/radioGroup';
import { getParamValueLimitIndex, getParamIcon } from '../../utils/paramSelection';
import { Table } from 'react-bootstrap';
import './livedata.scss';

export class livedata extends Component {
    constructor(props) {
        super(props);
        this.state = {
            center: { lat: 0, lng: 0 },
            generatedSensors: [],
            paramDefinitions: [],
            sensorData: [],
            deviceTableRow: [],
            deviceTableHead: [],
            radioButtons: [],
            selectedParam: [],
            toggleTableHead: {},
            showUserAssignModal: false,
            userAssignDeviceId: ''
        };

        this.paramShownHandleChange = this.paramShownHandleChange.bind(this);
        this.toggleUserAssignModal = this.toggleUserAssignModal.bind(this);
        this.isDerivedParamVisble = this.isDerivedParamVisble.bind(this);
    }

    async componentDidMount() {
        const paramDefinitions = await this.props.getDeviceSpec({});
        const sensorData = await this.props.getAllDeviceData({ groupByloc: true });
        this.updateData(paramDefinitions, sensorData)
        this.formatSensorData();
        this.formatRadioButton();
        this.formatTableHead();
        const count = await this.props.getDeviceCount();
        this.formatSensorList(count);
        if (this.props.selectedDevice) {
            this.updateMapViewArea();
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.selectedDevice !== this.props.selectedDevice) {
            this.updateMapViewArea();
            this.formatSensorData();
        }
    }

    updateMapViewArea() {
        this.setState({
            center: {
                lat: parseInt(this.props.selectedDeviceData.location.latitude, 10),
                lng: parseInt(this.props.selectedDeviceData.location.longitude, 10)
            }
        });
    }

    updateData(paramDefinitions, sensorData) {
        this.setState({ paramDefinitions: paramDefinitions, sensorData: sensorData });
    }

    toggleUserAssignModal(deviceId) {
        this.setState({
            showUserAssignModal: !this.state.showUserAssignModal,
            userAssignDeviceId: deviceId
        });
        setTimeout(async () => {
            const sensorData = await this.props.getAllDeviceData({ groupByloc: true });
            this.setState({ sensorData: sensorData });
            this.formatSensorData();
        }, 2000);
    }

    isDerivedParamVisble(derivedParam) {
        return this.state.toggleTableHead[derivedParam];
    }

    async formatSensorData() {
        const generatedSensors = [];
        const tableRow = [];
        this.state.sensorData.forEach(loc => {
            let td = [<td className="tableData" rowSpan={loc.count} key="locid">{loc._id}</td>];
            loc.records.forEach(sensor => {
                const mapDisplay = { comp1: {}, comp2: {} };
                for (let comp = 1; comp < 3; comp++) {
                    mapDisplay['comp' + String(comp)] = {
                        ...{
                            needServ: sensor.data['need_service_' + String(comp)],
                            timeFilled75: sensor.data['time_filled_75_' + String(comp)],
                            isServerd: sensor.data['is_serverd_' + String(comp)],
                            serverdAt: sensor.data['serverd_at_' + String(comp)],
                            serverdBy: sensor.data['serverd_by_' + String(comp)]
                        }
                    }
                }
                generatedSensors.push(
                    <Sensor key={sensor.deviceId} sensorId={sensor.deviceId} mode="circle" lat={sensor.data.latitude}
                        lng={sensor.data.longitude} mapDisplay={mapDisplay}
                    />
                );
                td.push(<td className="tableData" key="deviceId">{sensor.deviceId}</td>);
                this.state.paramDefinitions.forEach((param) => {
                    if ((param.isDisplayEnabled || param.isDerived) && param.paramName !== "time"
                        && sensor.data[param.paramName] !== "undefined"
                        && (this.state.toggleTableHead[param.paramName] ||
                            (param.derivedParam && param.derivedParam.some(this.isDerivedParamVisble)))) {
                        let tdData;
                        if (param.valueType === "time" && sensor.data[param.paramName] !== 'None') {
                            const time = new Date(parseInt(sensor.data[param.paramName], 10));
                            tdData = time.toLocaleTimeString();
                        } else if (param.valueType === "date" && sensor.data[param.paramName] !== 'None') {
                            const time = new Date(parseInt(sensor.data[param.paramName], 10));
                            tdData = time.toLocaleString();
                        } else {
                            const limitIndex = getParamValueLimitIndex(param.limits, sensor.data[param.paramName]);
                            tdData = [sensor.data[param.paramName] + param.unit]
                            tdData.push(getParamIcon(param.displayImage, limitIndex));
                        }
                        if (param.showUserAssignButton) {
                            tdData.push(<Button key={sensor.deviceId} onClick={() => { this.toggleUserAssignModal(sensor.deviceId) }}>
                                Assign
                            </Button>);
                        }
                        td.push(<td className="tableData" key={param.paramName}>{tdData}</td>);
                    }
                });
                tableRow.push(
                    <tr key={sensor.deviceId}
                        onClick={() => this.selectSensor(sensor.deviceId)}
                        className={(this.props.selectedDevice === sensor.deviceId) ? "selected-row" : ""}
                    >
                        {td}
                    </tr>)
                td = [];
            });

        });
        this.setState({
            generatedSensors: generatedSensors,
            deviceTableRow: tableRow
        })
    }

    formatTableHead() {
        const deviceTableHead = [<th key="locId">Location</th>, <th key="deviceId">PostBox ID</th>]
        this.state.paramDefinitions.forEach((param) => {
            if ((param.isDisplayEnabled || param.isDerived) && param.paramName !== "time" &&
                (this.state.toggleTableHead[param.paramName] ||
                    (param.derivedParam && param.derivedParam.some(this.isDerivedParamVisble)))) {
                deviceTableHead.push(<th key={param.paramName} title={param.paramDescription}>{param.displayTableHead}</th>);
            }
        });
        this.setState({
            deviceTableHead: deviceTableHead,
        })
    }

    formatRadioButton() {
        const radioButtons = [];
        const toggleTableHead = {}
        this.state.paramDefinitions.forEach((param) => {
            if (param.isDisplayEnabled && !param.showWithAllParam && param.paramName !== "time") {
                radioButtons.push({
                    params: param.displayName,
                    value: param.paramName
                });
                toggleTableHead[param.paramName] = 0;
            }
            if (param.paramName === "receivedTime") toggleTableHead[param.paramName] = 1;
        });
        this.setState({
            radioButtons: radioButtons,
            toggleTableHead: toggleTableHead,
        })
    }

    async formatSensorList(count) {
        for (let i = 0; i < count; i++) {
            const sensorData = await this.props.getDeviceDetails(i);
            if (i === 0 && !this.props.selectedDevice) {
                this.props.updateSelectedDevice(sensorData.deviceId);
            }
        }
    }

    selectSensor(id) {
        if (this.props.selectedDevice !== id) {
            this.props.updateSelectedDevice(id);
        }
    }

    paramShownHandleChange(val) {
        const toggleTableHead = this.state.toggleTableHead;
        let selectedParam;
        if (val.length > 1) {
            toggleTableHead[val[1]] = 1;
            toggleTableHead[this.state.selectedParam[0]] = 0;
            selectedParam = val[1];
        } else if (val.length === 1) {
            toggleTableHead[val[0]] = 1;
            selectedParam = val[0]
        } else {
            toggleTableHead[this.state.selectedParam[0]] = 0;
        }
        this.setState({
            toggleTableHead: toggleTableHead,
            selectedParam: [selectedParam]
        });
        this.formatSensorData();
        this.formatTableHead();
    }

    render() {
        return (
            <div data-test="mainLiveDataTag">
                <Container responsive="lg" className="container py-4">
                    <h2>Devices</h2>
                    <GoogleMap center={this.state.center}>
                        {this.state.generatedSensors}
                    </GoogleMap>
                    <RadioGroup radioShown={this.state.selectedParam}
                        radioShownHandleChange={this.paramShownHandleChange}
                        index={this.state.radioButtons}
                    />
                    <Table data-test="liveDataTable" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                {this.state.deviceTableHead}
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.deviceTableRow}
                        </tbody>
                    </Table>
                </Container>

                <Container responsive="lg" className="container py-4">
                    <h2>Data Statistics</h2>
                    <DataStats />
                </Container>
                { this.state.showUserAssignModal &&
                    <UserAssign
                        show={this.state.showUserAssignModal}
                        handleClose={this.toggleUserAssignModal}
                        deviceId={this.state.userAssignDeviceId}
                    />
                }
            </div>
        )
    }
}

export function mapStateToProps(state) {
    return ({
        selectedDevice: state.devices.selectedDevice,
        selectedDeviceData: state.devices.data[state.devices.selectedDevice]
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        updateSelectedDevice: (id) => {
            return dispatch(updateSelectedDevice(id))
        },
        getDeviceCount: () => {
            return dispatch(getDeviceCount(dispatch))
        },
        getDeviceDetails: (id) => {
            return dispatch(getDeviceDetails(dispatch, id))
        },
        getDeviceSpec: (options) => {
            return dispatch(getDeviceSpec(dispatch, options))
        },
        getAllDeviceData: (option) => {
            return dispatch(getAllDeviceData(option))
        }
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(livedata);
