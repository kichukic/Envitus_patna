import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateFormValue, updateFormValidation } from '../../action/formAction'
import { Row, Col } from 'react-bootstrap';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';

export class AlarmruleDeviceForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            table: {head: [], body: []},
            showOprn: false,
        }
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        this.loadDeviceTable();
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.loadDeviceTable();
        }
    }

    onChange(deviceId, logicalDeviceId) {
        const info = {...this.props.alarmruleFrmDta.info};
        const deviceObject = {deviceId: deviceId, logicalDeviceId: logicalDeviceId}
        if(info.deviceIds.some((existingDevice) => { return existingDevice.deviceId === deviceId})) {
            info.deviceIds = info.deviceIds.filter((existingDevice) => {return existingDevice.deviceId !== deviceId})
        } else {
            info.deviceIds.push(deviceObject)
        }
        this.props.updateFormValue({info: info});
    }

    loadDeviceTable() {
        const tableHead = ['Device ID', 'Family' ,'City', 'Selection'];
        const tableBody = this.props.allDevices.map((device) => {
            const devPresent = this.props.alarmruleFrmDta.info.deviceIds.some((existingDevice) => {
                return existingDevice.deviceId === device.deviceId
            })
            const selection =
                <input type="checkbox" checked={devPresent} 
                    onChange={() => this.onChange(device.deviceId, device.logicalDeviceId)} 
                />
            const deviceDetails = [device.deviceId, device.devFamily, device.location.city,
                selection
            ];
            return deviceDetails;
        });
        this.setState({table: {head: tableHead, body: tableBody}})
    }

    render() {
        const alignLeft = true;
        return (
            <div>
                {(this.state.table.body.length > 0) &&
                    <React.Fragment>
                        <Row className="form-sub-heading">
                            <Col sm={12}>
                                <h5>Device Addition</h5>
                                <hr className="my-3 w-100" />
                            </Col>
                        </Row>
                        <LiveDataTable tableBody={this.state.table.body} tableHead={this.state.table.head} 
                            showOprn={this.state.showOprn} alignLeft={alignLeft}
                        />
                    </React.Fragment>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        alarmruleFrmDta: state.formData.data,
        updateType: state.formData.updateType
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

export default connect(mapStateToProps, mapDispatchToProps)(AlarmruleDeviceForm);
