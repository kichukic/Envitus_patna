import React from 'react';
import { connect } from 'react-redux';
import Sensor from '../sensor/sensor';
import { updateSelectedDevice } from '../../action/deviceAction';
import { getDeviceCount, getDeviceDetails} from '../../services/deviceApi';
import { Table } from 'react-bootstrap';
import { MdModeEdit, MdDelete } from "react-icons/md";

export class DeviceList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            deviceList: null,
        };
    }

    async componentDidMount() {
        const option = {deviceId: 'null', zone: 'null', city: 'null', subType: 'null', activated: 'null'}
        const count = await this.props.getDeviceCount(option);
        (this.props.listType === "sensor") ? await this.formatSensorList(count) : (
            (this.props.listType === "sensor3D") ? await this.formatSensor3DList(count) 
                : await this.formatTableList(count)
        );	
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.updateList !== this.props.updateList || prevProps.selectedDevice!== this.props.selectedDevice) {
            const option = {deviceId: 'null', zone: 'null', city: 'null', subType: 'null', activated: 'null'}
            const count = await this.props.getDeviceCount(option);
            (this.props.listType === "sensor") ? await this.formatSensorList(count) : (
                (this.props.listType === "sensor3D") ? await this.formatSensor3DList(count) 
                    : await this.formatTableList(count)
            );	
        }
    }

    selectSensor(id) {
        if(!this.props.showDeviceOprn && this.props.selectedDevice !== id) {
            this.props.updateSelectedDevice(id);
        }
    }

    async formatSensorList(count) {
        const sensorElements = [];
        for (let i = 0; i < count; i++) {
            const sensorData = await this.props.getDeviceDetails(i);
            const divStyle = {
                top: sensorData.location.latitude + '%',
                left: sensorData.location.longitude + '%',
                backgroundColor: '#27AE60'
            };
        
            sensorElements.push(
                <Sensor data-test="deviceListSensor" sensorId={sensorData.deviceId} 
                    key={sensorData.deviceId} mode="circle" positionStyle={divStyle} 
                />
            );
            
            if(i === 0 && !this.props.selectedDevice) {
                this.props.updateSelectedDevice(sensorData.deviceId);
            }			
        }
        this.setState({deviceList: <div>{sensorElements}</div>});
    }

    async formatSensor3DList(count) {
        const sensorElements = [];
        for (let i = 0; i < count; i++) {
            const sensorData = await this.props.getDeviceDetails(i);
            const divStyle = {
                slot: sensorData.location.slot,
                position: sensorData.location.dataPosition,
                normal: sensorData.location.dataNormal
            };

            sensorElements.push(
                <Sensor sensorId={sensorData.deviceId} key={sensorData.deviceId} mode="circle3D"
                    positionStyle={divStyle} data-test="deviceListSensor3D"
                />
            );
            
            if(i === 0 && !this.props.selectedDevice) {
                this.props.updateSelectedDevice(sensorData.deviceId);
            }			
        }
        this.setState({deviceList: [sensorElements]});
    }

    async formatTableList(count) {
        const sensorElements = [];
        for (let i = 0; i < count; i++) {
            const sensorData = await this.props.getDeviceDetails(i);
            sensorElements.push(
                <tr key={sensorData.deviceId} 
                    onClick={() => this.selectSensor(sensorData.deviceId)}
                    className={(this.props.selectedDevice === sensorData.deviceId) ? "selected-row" : ""}
                >
                    <td>{sensorData.deviceId}</td>
                    <td>{sensorData.type}</td>
                    <td>{sensorData.devFamily}</td>
                    <td>{sensorData.subType}</td>
                    {this.props.showDeviceOprn &&
                    <td className="editClass" data-test="formatOperation">
                        <MdModeEdit onClick={() => this.props.updateDevice(sensorData.deviceId)} 
                            data-test="operationEdit"
                        />
                        <MdDelete onClick={() => this.props.deleteDevice(sensorData.deviceId)}
                            data-test="operationDlt"
                        />
                    </td>
                    }
                </tr>
            );	
            
            if(!this.props.showDeviceOprn && i === 0 && !this.props.selectedDevice) {
                this.props.updateSelectedDevice(sensorData.deviceId);
            }
        }
        this.setState({deviceList: this.getTableStruture(sensorElements)});
    }

    getTableStruture(deviceRows) {
        return (
            <Table data-test="deviceListTable" striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Device Id</th>
                        <th>Type</th>
                        <th>Family</th>
                        <th>Sub-Type</th>
                        {this.props.showDeviceOprn &&
                            <th data-test="operation">Operations</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {deviceRows}
                </tbody>
            </Table>
        );
    }
  
    render() {
        return this.state.deviceList;
    }
}

export function mapStateToProps(state) {
    return ({
        deviceCount: state.devices.deviceCount,
        selectedDevice: state.devices.selectedDevice
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        getDeviceCount: (option) => {
            return dispatch(getDeviceCount(dispatch, option))
        },
        getDeviceDetails: (id) => {
            return dispatch(getDeviceDetails(dispatch, id))
        },
        updateSelectedDevice: (id) => {
            return dispatch(updateSelectedDevice(id))
        }    
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceList);
