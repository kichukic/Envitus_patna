import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import Loader from 'react-loader-spinner';
import { filter } from 'lodash';
import { getDashboardData, getDashboardDataCount } from '../../services/liveDataApi';
import { diagError } from '../../utils/diagnosticErrors';
import DeviceTable from '../../components/devicesList/deviceTable';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';
import Paginations from '../../components/paginations/paginations';
import './diagnostics.scss'

export class Diagnostics extends Component {
    constructor(props) {
        super(props);
        this.state = {
            table: {content: '', count: 0},
            select: '',
            selectedTable: {label: '', value: ''},
            limit: 20,
            offset: 0,
        }

        this.pagnCallback = this.pagnCallback.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedDevice) {
            this.setInitSetting();
            this.fetchErrors();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedDevice !== this.props.selectedDevice) {
            this.setInitSetting();
            this.fetchErrors();
        }
    }

    setInitSetting() {
        const select = filter(this.props.selectedDeviceData.paramDefinitions, { 'paramType': 'error' }).map(param => {
            return ({label: param.displayName, value: param.paramName})
        })
        this.setState({select: select, selectedTable: select[0]});
    }

    async fetchErrors() {
        const loader = <div className="text-center">
            <Loader style={{padding: '6%'}} type="MutatingDots" color="#00BFFF" height={100} width={100} />
            <br/><strong className="lead">Loading !!</strong></div>
        this.setState({table: {content: loader, count: 0}})
        const countOption = { deviceIds: this.props.selectedDeviceData.logicalDeviceId };
        const count = await this.props.getDashboardDataCount(countOption);
        if(count !== 0) {
            const options = {
                deviceIds: this.props.selectedDeviceData.logicalDeviceId,
                limit: this.state.limit,
                offset: this.state.offset,
                timeStart: null,
                timeEnd: null,
            };
            const rawData = await this.props.getDashboardData(options);
            if(rawData.length !== 0) {
                const head = ['Date', 'Errors']; const alignLeft = true;
                const body = this.generateErrs(this.state.selectedTable.value, rawData);
                const table = <LiveDataTable tableBody={body} tableHead={head} alignLeft={alignLeft}/>
                this.setState({table: {content: table, count: count}})
            }
        } else {
            const notFound = <div className="text-center">
                <img style={{margin: '6%'}} src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
                <br/><strong className="lead">No Data !!</strong></div>
            this.setState({table: {content: notFound, count: 0}})
        }
    }

    generateErrs(errorName, rawData) {
        const allErrors = []
        rawData.forEach(data => {
            const errors = this.convertCode(data.data[errorName]);
            const partErrorDesc = [];
            if(errors !== false) {
                errors.forEach((err, count) => {
                    if(err === '1') {
                        if(errorName === 'er_system') {
                            partErrorDesc.push(diagError[process.env.REACT_APP_DIAGNOSTICS].sysErr[count])
                        } else if(errorName === 'er_data_range') {
                            partErrorDesc.push(diagError[process.env.REACT_APP_DIAGNOSTICS].rangeErr[count])
                        } else {
                            partErrorDesc.push(diagError[process.env.REACT_APP_DIAGNOSTICS].mainErr[count])
                        }
                    }   
                }) 
            } else {partErrorDesc.push('No Error Data Found')}
            allErrors.push([new Date(data.data.receivedTime).toLocaleString()].concat(partErrorDesc.join(', ')));
        })
        return allErrors;
    }

    convertCode(code) {
        if(code) {
            let binary = parseInt(code, 10).toString(2);
            binary = Array(33).join("0").substr(binary.length) + binary;
            const binaryArr = binary.split("");
            binaryArr.reverse();
            return binaryArr;
        }
        return false;
    }

    handleChange(keyVal) {
        this.setState({selectedTable: keyVal}, () => this.fetchErrors())
    }

    pagnCallback(newOffset) {
        this.setState({offset: newOffset});
        this.fetchErrors();
    }

    render() {
        const hideOprn = true; const hideDeact = true; const enableSltDev = true;
        return (
            <div>
                <DeviceTable hideOprn={hideOprn} hideDeact={hideDeact} enableSltDev={enableSltDev} />
                <Container className="dia-mt-crctn">
                    <div className="bg-white shadow p-1 rounded">
                        <Row>
                            <Col className="px-4 pt-2">
                                <h5 className="font-weight-light">{this.state.selectedTable.label}</h5>
                            </Col>
                            <Col className="py-1 pr-4">
                                <DropdownButton alignRight title="Error Type" className="float-right">
                                    {(this.state.select.length !== 0) && 
                                        this.state.select.map((error) => (
                                            <Dropdown.Item key={error} onClick={() => this.handleChange(error)}>
                                                {error.label}
                                            </Dropdown.Item>
                                        ))
                                    }
                                </DropdownButton>
                            </Col>
                        </Row>
                    </div>
                    <div className="mt-2 mb-4">
                        {this.state.table.content}
                        <Paginations userCount={this.state.table.count} limit={this.state.limit}
                            offset={this.state.offset} pagnCallback={this.pagnCallback}
                        />
                    </div>
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
        getDashboardData: (options) => {
            return dispatch(getDashboardData(dispatch, options))
        },
        getDashboardDataCount : (options) => {
            return dispatch(getDashboardDataCount(dispatch, options))
        }  
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Diagnostics);
