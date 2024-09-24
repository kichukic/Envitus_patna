import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getDeviceSpec} from '../../services/deviceApi';
import { getAllDeviceData } from '../../services/liveDataApi';
import { getParamValueLimitIndex, getParamIcon } from '../../utils/paramSelection';
import { Table } from 'react-bootstrap';
import './daliyReport.scss';

export class DaliyReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            paramDefinitions: [],
            sensorData: [],
            deviceTableRow: [],
            deviceTableHead: [],
            radioButtons: [],
            toggleTableHead: {}
        };
    }

    async componentDidMount() {
        const paramDefinitions = await this.props.getDeviceSpec({});
        const sensorData = await this.props.getAllDeviceData({groupByloc: true});
        this.updateData(paramDefinitions, sensorData)
        this.formatSensorData();
        this.formatTableHead();
    }

    updateData(paramDefinitions, sensorData) {
        this.setState({paramDefinitions: paramDefinitions, sensorData: sensorData});
    }

    async formatSensorData() {
        const tableRow = [];
        this.state.sensorData.forEach(loc => {
            let td = [<td className="tableData" rowSpan={loc.count} key="locid">{loc._id}</td>];
            loc.records.forEach(sensor => {
                td.push(<td className="tableData" key="deviceId">{sensor.deviceId}</td>);
                this.state.paramDefinitions.forEach((param) =>{
                    if( param.isDailyReportField && sensor.data[param.paramName] !== "undefined" ) {
                        let tdData;
                        if(param.valueType === "time" && sensor.data[param.paramName] !== 'None') {
                            const time = new Date(parseInt(sensor.data[param.paramName], 10));
                            tdData = time.toLocaleTimeString();
                        } else if(param.valueType === "date" && sensor.data[param.paramName] !== 'None') {
                            const time = new Date(parseInt(sensor.data[param.paramName], 10));
                            tdData = time.toLocaleString();
                        } else {
                            const limitIndex = getParamValueLimitIndex(param.limits, sensor.data[param.paramName]);
                            tdData = [sensor.data[param.paramName] + param.unit]
                            tdData.push(getParamIcon(param.displayImage, limitIndex));
                        }
                        td.push(<td className="tableData" key={param.paramName}>{tdData}</td>);
                    }
                });
                tableRow.push(
                    <tr key={sensor.deviceId}
                        className={(this.props.selectedDevice === sensor.deviceId) ? "selected-row" : ""}
                    >
                        {td}
                    </tr>)
                td = [];
            });
            
        });        
        this.setState({
            deviceTableRow: tableRow
        })
    }

    formatTableHead() {
        const deviceTableHead = [<th key="locId">Location</th>, <th  key="deviceId">PostBox ID</th>]
        this.state.paramDefinitions.forEach((param) =>{
            if(param.isDailyReportField) {
                deviceTableHead.push(<th key={param.paramName} title={param.paramDescription}>{param.DailyReportHead}</th>);
            }
        });
        this.setState({
            deviceTableHead: deviceTableHead,
        }) 
    }

    render() {
        return (
            <div data-test="mainLiveDataTag">
                <Container responsive="lg" className="container py-4">
                    <h2>Daliy Report</h2>
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
        getDeviceSpec: (options) => {
            return dispatch(getDeviceSpec(dispatch, options))
        },
        getAllDeviceData: (option) => {
            return dispatch(getAllDeviceData(option))
        }  
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DaliyReport);
