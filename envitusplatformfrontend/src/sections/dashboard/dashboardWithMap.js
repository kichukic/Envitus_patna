import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getDeviceCount, getDeviceDetails } from '../../services/deviceApi';
import { getDataStats } from '../../services/dataStatsApi';
import { getActiveAlarmCount } from '../../services/alarmApi';
import { updateSelectedDevice } from '../../action/deviceAction';
import { checkPrerequisite } from '../../utils/csvDownloadPrereq';
import { getParamValueLimitIndex } from '../../utils/paramSelection';

import Sensor from '../../components/sensor/sensor';
import GoogleMap from '../../components/googleMap/googleMap';
import BarChart from '../../components/charts/barChart';
import DoughnutChart from '../../components/charts/doughnutChart';

import { Container, Button, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import { MdDateRange, MdAccessTime,  MdRefresh } from "react-icons/md";
import { toastr } from 'react-redux-toastr';
import Select from 'react-select';
import Loader from 'react-loader-spinner';

export class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sensors: "",
            selectDevices: "",
            selectParams: "",
            selectedParam: "",
            date: "",
            time: "",
            mapCenter: { lat: '', lng: '' },
            cards: {card1: {title: 'Device', value: ''}, card2: {title: 'Alerts', value: ''},
                card3: {title: '', value: ''}, card4: {title: '', value: ''}
            },
            paramInfo: {chart: '', info: ''},
            refreshData: '',
        }

        this.updateInputs = this.updateInputs.bind(this);
        this.refrDateAndReset = this.refrDateAndReset.bind(this);
        this.doRefreshData = this.doRefreshData.bind(this);
    }

    async componentDidMount() {
        const option = {deviceId: 'null', zone: 'null', city: 'null', subType: 'null', activated: 'null'}
        const count = await this.props.getDeviceCount(option);
        if(count > 0) {
            this.formatSensorList(count);
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.selectedDevice !== this.props.selectedDevice) {
            this.updateDeviceConfig();
            this.getStatistics();
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshData);
    }

    doRefreshData() {
        this.setState({refreshData: setInterval(
            () => {
                this.updateDeviceConfig();
                this.getStatistics();
            }, (15 * (60 * 1000))
        )})
    }

    async formatSensorList(count) {
        const sensors = []; const selectDevices = [];
        const dashParam = process.env.REACT_APP_DASHBOARD_PARAM.split(", ").map((param) => JSON.parse(param))
        for (let i = 0; i < count; i++) {
            const sensorData = await this.props.getDeviceDetails(i);
            if(sensorData.activated) {
                const isLive = (sensorData.lastDataReceiveTime) ? (((new Date().valueOf() - sensorData.lastDataReceiveTime)
                    < (15 * 60 * 1000)) ? {backgroundColor: '#27AE60'} : {backgroundColor: '#696969'}) : {backgroundColor: '#696969'};

                let currentAQI = false;
                if(dashParam[0].pName === 'AQI') {
                    currentAQI = (sensorData.latestAQI === "") ? {aqi: "No Sufficient Data", date: "No Sufficient Data"} : {
                        aqi: (sensorData.latestAQI.statParams.sum/sensorData.latestAQI.statParams.count).toFixed(0),
                        date: sensorData.latestAQI.key
                    }
                }

                sensors.push(
                    <Sensor key={sensorData.deviceId} sensorId={sensorData.deviceId} mode="circle"
                        lat={sensorData.location.latitude}lng={sensorData.location.longitude}
                        positionStyle={isLive} currentAQI={currentAQI}
                    />
                );

                const selectParams = sensorData.paramDefinitions.filter(param => {
                    return param.isDisplayEnabled && !param.valueType
                }).map(item => {
                    return {label: item.displayName, value: item.paramName, id: 'parameter' }
                })

                const station = { label: sensorData.location.landMark, value: sensorData.deviceId,
                    id: 'station', selectParams: selectParams
                };
                selectDevices.push(station);
            }
        }

        if (!this.props.selectedDevice && (selectDevices.length !== 0)) {
            this.props.updateSelectedDevice(selectDevices[0].value);
        }

        const today = new Date();
        const cards = {...this.state.cards}
        cards.card3.title = dashParam[0].dName; cards.card4.title = dashParam[1].dName;
        this.setState({
            sensors: sensors,
            selectDevices: selectDevices,
            selectedParam: selectDevices[0].selectParams[0].value,
            selectParams: selectDevices[0].selectParams,
            date: today.toLocaleDateString("en-CA"),
            time: today.toLocaleTimeString("en-GB", {timeStyle: 'short'}),
            cards: cards
        }, () => {
            if (this.props.selectedDevice) {
                this.updateDeviceConfig();
                this.getStatistics();
            }
        })
    }

    async getStatistics() {
        const loader = <div className="text-center">
            <Loader type="MutatingDots" color="#00BFFF" height={100} width={100} />
            <strong className="lead">Loading !!</strong></div>
        let cards = {...this.state.cards}
        cards.card2.value = loader; cards.card3.value = loader; cards.card4.value = loader;
        this.setState({cards: cards})

        const actAlarmCnt = await this.props.getActiveAlarmCount();
        cards = {...this.state.cards}
        cards.card2.value = actAlarmCnt.recordCount;
        this.setState({cards: cards})

        const epoch = checkPrerequisite(this.state.date, this.state.date, 2, false, 'daily');
        if(epoch.returnValue) {
            const commonOption = {
                deviceIds: this.props.selectedDeviceData.deviceId,
                offset: 0,
                timeStart: epoch.epochStartDate,
                timeEnd: epoch.epochEndDate,
            }

            const dashParam = process.env.REACT_APP_DASHBOARD_PARAM.split(", ").map((param) => JSON.parse(param))
            const dlParams = [dashParam[0].pName, dashParam[1].pName, this.state.selectedParam];
            if(dashParam[0].pName === 'AQI' || dashParam[1].pName === 'AQI') {
                dlParams.push('prominentPollutant')
            }

            const daily = await this.props.getDataStats({...commonOption, ...{
                params: dlParams.join(','), limit: dlParams.length, timeFrame: 'daily'
            }});

            const hourly = await this.props.getDataStats({...commonOption, ...{
                params: this.state.selectedParam, limit: 24, timeFrame: 'hourly'
            }});

            const param1 = daily.stat.dailyStat.find(param => param.paramName === dashParam[0].pName);
            const param2 = daily.stat.dailyStat.find(param => param.paramName === dashParam[1].pName);
            const param3 = daily.stat.dailyStat.find(param => param.paramName === 'prominentPollutant');
            const param4 = daily.stat.dailyStat.find(param => param.paramName === this.state.selectedParam);

            let hourlyStat = hourly.stat.hourlyStat;
            const hhmm = this.state.time.split(':')
            const filtertill = epoch.epochStartDate + (hhmm[0] * 60 * 60 * 1000) + (hhmm[1] * 60 * 1000);
            hourlyStat = hourlyStat.filter(data => data.key <= filtertill);

            this.generateCards(param1, param2, param3);
            if(hourlyStat.length !== 0) { this.genrateGraphs(hourlyStat, param4) }
            else {
                toastr.error('Oops !!', 'Data Absent for the selected Parameter');
                this.setState({paramInfo: {chart: '', info: ''}})
            }
        }
    }

    generateCards(param1, param2, param3) {
        const notFound = <span className="d-flex justify-content-center">
            <img className="mt-3" src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
        </span>

        const cards = {...this.state.cards}
        let p1Description = '';
        if(param1 && param1.statParams.count !== '') {
            const p1Def = this.props.selectedDeviceData.paramDefinitions.find(param => {
                return param.paramName === param1.paramName
            })

            const p1Val = (p1Def.needCumil) ? Number(param1.statParams.sum.toFixed(p1Def.valuePrecision)) :
                Number((param1.statParams.sum / param1.statParams.count).toFixed(p1Def.valuePrecision))
            const p1LimitIndex = getParamValueLimitIndex(p1Def.limits, p1Val);

            const p1Graph = {
                datasets: [{
                    backgroundColor: ['#' + p1Def.limits[p1LimitIndex].color, "#E8E8E8"],
                    borderWidth: [0, 0],
                    data: [p1Val, (p1Def.maxRanges.max - p1Val)]
                }]
            }

            const p1Text = String(p1Val) + p1Def.unit;
            p1Description = p1Def.limits[p1LimitIndex].description;

            cards.card3.value = <div className="p-1 mt-3"><DoughnutChart chartData={p1Graph} text={p1Text} /></div>
        } else {
            cards.card3.value = notFound;
        }

        if(param2 && param2.statParams.count !== '') {
            const p2Def = this.props.selectedDeviceData.paramDefinitions.find(param => {
                return param.paramName === param2.paramName
            })

            const p2Val = (p2Def.needCumil) ? Number(param2.statParams.sum.toFixed(p2Def.valuePrecision)) :
                Number((param2.statParams.sum / param2.statParams.count).toFixed(p2Def.valuePrecision))
            const p2LimitIndex = getParamValueLimitIndex(p2Def.limits, p2Val);

            const p2Graph = {
                datasets: [{
                    backgroundColor: ['#' + p2Def.limits[p2LimitIndex].color, "#E8E8E8"],
                    borderWidth: [0, 0],
                    data: [p2Val, (p2Def.maxRanges.max - p2Val)]
                }]
            }

            const p2Text = String(p2Val) + p2Def.unit;

            cards.card4.value = <div className="p-1 mt-3"><DoughnutChart chartData={p2Graph} text={p2Text} /></div>
        } else {
            cards.card4.value = notFound;
        }

        const p3Val = [...cards.card1.value].filter(item =>
            (item.name !== 'Prom. Poll.' && item.name !== 'City' && item.name !== 'Zone' && item.name !== 'Param1 Desc.')
        )
        if(param3) {
            cards.card1.value = [...p3Val, ...[
                { name: 'Param1 Desc.', value: p1Description },
                { name: 'Prom. Poll.', value: param3.statParams.latestValue }
            ]];
        } else {
            const sdData = this.props.selectedDeviceData;
            cards.card1.value = [...p3Val, ...[
                { name: 'City', value: sdData.location.city },
                { name: 'Zone', value: sdData.location.zone }
            ]];
        }

        this.setState({cards: cards})
    }

    genrateGraphs(hourly, param4) {
        const hourlyRev = hourly.reverse();
        const labels = []; const avgs = []; const colors = [];
        const pDef = this.props.selectedDeviceData.paramDefinitions.find(param => {
            return param.paramName === hourly[0].paramName
        })

        hourlyRev.forEach(data => {
            if(data.statParams.count !== '') {
                const val = (pDef.needCumil) ? Number(data.statParams.sum.toFixed(pDef.valuePrecision)) :
                    Number((data.statParams.sum / data.statParams.count).toFixed(pDef.valuePrecision))
                const limitIndex = getParamValueLimitIndex(pDef.limits, val);
                avgs.push(val)
                labels.push(new Date(data.key).toLocaleString())
                colors.push('#' + pDef.limits[limitIndex].color);
            }
        })

        const datasets = [{
            fill: false,
            lineTension: 0.5,
            backgroundColor: colors,
            borderWith: 1,
            data: avgs
        }]

        const unit = pDef.unit;
        let info = '';
        if(param4.statParams.count !== '') {
            info = [
                {name: 'Date', value: param4.key},
                {name: 'Daily Minimun', value: (String(param4.statParams.min.toFixed(pDef.valuePrecision)) + ' ' + unit)},
                {name: 'Daily Maximum', value: (String(param4.statParams.max.toFixed(pDef.valuePrecision)) + ' ' + unit)},
                {name: 'Daily Average',
                    value: (String((param4.statParams.sum / param4.statParams.count).toFixed(pDef.valuePrecision)) + ' ' + unit)},
                {name: 'Daily Sum',
                    value: (String((param4.statParams.sum).toFixed(pDef.valuePrecision)) + ' ' + unit)},
                {name: 'Count', value: param4.statParams.count}
            ]
        }

        this.setState({paramInfo: {chart: { labels: labels, datasets: datasets }, info: info}})
    }

    updateDeviceConfig() {
        const sdData = this.props.selectedDeviceData;
        const cards = {...this.state.cards}
        const today = new Date().valueOf();
        let rtStatus = 'No Data'; let ntStatus = 'No Data';

        if(sdData.lastDataReceiveTime !== "") {
            let rtDiff = Math.abs(today - sdData.lastDataReceiveTime);
            const rtHH = Math.floor(rtDiff / 1000 / 60 / 60);
            rtStatus = rtHH + 'hrs';
            if(rtHH < 96) {
                rtDiff -= rtHH * 1000 * 60 * 60;
                const rtMM = Math.floor(rtDiff / 1000 / 60);
                rtStatus = rtStatus + ' ' + rtMM + 'mins';
            }
        }

        if(sdData.nearTimeStatus !== "") {
            let ntDiff = Math.abs(today - sdData.nearTimeStatus);
            const ntHH = Math.floor(ntDiff / 1000 / 60 / 60);
            ntStatus = ntHH + 'hrs';
            if(ntHH < 96) {
                ntDiff -= ntHH * 1000 * 60 * 60;
                const ntMM = Math.floor(ntDiff / 1000 / 60);
                ntStatus = ntStatus + ' ' + ntMM + 'mins';
            }
        }

        const deviceDetails = [
            {name: 'DeviceID', value: sdData.deviceId},
            {name: 'RT Status', value: rtStatus},
            {name: 'NT Status', value: ntStatus}
        ]

        cards.card1.value = deviceDetails;

        this.setState({mapCenter: {
            lat: parseInt(sdData.location.latitude, 10),
            lng: parseInt(sdData.location.longitude, 10)
        }, cards: cards});
    }

    refrDateAndReset() {
        const today = new Date();
        this.setState({date: today.toLocaleDateString("en-CA"), time: today.toLocaleTimeString("en-GB", {timeStyle: 'short'})}, () => {
            this.getStatistics()
        });
    }

    getDefaultValue(value, type) {
        if(!this.props.selectedDevice || (this.state.selectDevices === "") || (this.state.selectParams === "")) {
            return '';
        }

        let data = '';
        switch (type) {
        case 'station':
            data = this.state.selectDevices.find(element => element.value === value)
            break;
        case 'parameter':
            data = this.state.selectParams.find(element => element.value === value)
            break;
        default:
            break;
        }
        return data;
    }

    updateInputs(event) {
        if(event.target) {
            if(event.target.value === "") {
                toastr.error('Oops !!', 'Date and Time should not be empty');
            } else {
                this.setState({[event.target.name]: event.target.value})
            }
        } else {
            switch (event.id) {
            case 'station':
                this.props.updateSelectedDevice(event.value);
                break;
            case 'parameter':
                this.setState({selectedParam: event.value}, () => this.getStatistics());
                break;
            default:
                break;
            }
        }
    }

    render() {
        return (
            <div>
                <Container className="mt-4">
                    <Row>
                        <Col sm={12} md={3}>
                            <Select className="rounded shadow" value={this.getDefaultValue(this.props.selectedDevice, 'station')}
                                options={this.state.selectDevices} onChange={this.updateInputs}
                            />
                        </Col>
                        <Col sm={12} md={3} className="mt-2 mt-md-0">
                            <InputGroup className="w-100 rounded shadow">
                                <InputGroup.Prepend><InputGroup.Text><MdDateRange /></InputGroup.Text></InputGroup.Prepend>
                                <FormControl type="date" name="date" value={this.state.date} onChange={this.updateInputs}/>
                            </InputGroup>
                        </Col>
                        <Col sm={12} md={3} className="mt-2 mt-md-0">
                            <InputGroup className="w-100 rounded shadow">
                                <InputGroup.Prepend><InputGroup.Text><MdAccessTime /></InputGroup.Text></InputGroup.Prepend>
                                <FormControl type="time" name="time" value={this.state.time} onChange={this.updateInputs}/>
                            </InputGroup>
                        </Col>
                        <Col sm={12} md={3} className="mt-2 mt-md-0">
                            <Button className="w-100 rounded shadow" onClick={() => this.getStatistics()}>Find</Button>
                        </Col>
                    </Row>
                </Container>

                <Container className="mt-4">
                    <Row>
                        <Col md={12} lg={6}>
                            <div className="rounded shadow" style={{ height: '75vh', width: '100%' }}>
                                {(this.state.mapCenter.lat !== "") &&
                                    <GoogleMap center={this.state.mapCenter}>{this.state.sensors}</GoogleMap>
                                }
                            </div>
                        </Col>
                        <Col md={12} lg={6} className="mt-4 mt-lg-0">
                            <Row>
                                <Col sm={12} md={6}>
                                    <div className="rounded shadow bg-white p-3" style={{ height: '34vh', width: '100%' }}>
                                        <h4>{this.state.cards.card1.title}</h4>
                                        {(this.state.cards.card1.value !== '') &&
                                        this.state.cards.card1.value.map(item => {
                                            return (
                                                <Row className="mt-1" key={item.name}>
                                                    <Col className="font-weight-light">{item.name}</Col>
                                                    <Col className="font-weight-light">{item.value}</Col>
                                                </Row>
                                            )
                                        })}
                                    </div>
                                </Col>
                                <Col sm={12} md={6}>
                                    <div className="rounded shadow bg-white p-3 mt-4 mt-md-0"
                                        style={{ height: '34vh', width: '100%' }}
                                    >
                                        <h4>{this.state.cards.card2.title}</h4>
                                        <h1 className="text-center" style={{fontSize: '100px'}}>
                                            {this.state.cards.card2.value}
                                        </h1>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-4">
                                <Col sm={12} md={6}>
                                    <div className="rounded shadow bg-white p-3" style={{ height: '37vh', width: '100%' }}>
                                        <h4>{this.state.cards.card3.title}</h4>
                                        <div>{this.state.cards.card3.value}</div>
                                    </div>
                                </Col>
                                <Col sm={12} md={6}>
                                    <div className="rounded shadow bg-white p-3 mt-4 mt-md-0"
                                        style={{ height: '37vh', width: '100%' }}
                                    >
                                        <h4>{this.state.cards.card4.title}</h4>
                                        <div>{this.state.cards.card4.value}</div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>

                <Container className="mt-4">
                    <div className="bg-white shadow rounded px-2 py-1">
                        <Row>
                            <Col className="px-4 pt-2">
                                <h5 className="font-weight-light">{this.props.selectedDevice}</h5>
                            </Col>
                            <Col className="d-flex justify-content-end py-1">
                                <Select className="w-50" value={this.getDefaultValue(this.state.selectedParam, 'parameter')}
                                    options={this.state.selectParams} onChange={this.updateInputs}
                                />
                                <Button className="mx-2" onClick={this.refrDateAndReset}><MdRefresh /></Button>
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <Row className="mt-4 mb-3">
                            <Col md={12} lg={8}>
                                <div className="bg-white rounded shadow p-4" style={{ height: '70vh', width: '100%' }}>
                                    <div className="mt-4"><BarChart chartData={this.state.paramInfo.chart} /></div>
                                </div>
                            </Col>
                            <Col md={12} lg={4} className="mt-4 mt-lg-0">
                                <div className="bg-white rounded shadow p-4" style={{ height: '70vh', width: '100%' }}>
                                    {(this.state.paramInfo.info !== '') &&
                                        <div className="mb-3">
                                            <h1>Statistics</h1>
                                        </div>
                                    }
                                    {(this.state.paramInfo.info !== '') &&
                                    this.state.paramInfo.info.map(item => {
                                        return (
                                            <Row className="mt-1" key={item.name}>
                                                <Col><h5 className="font-weight-light">{item.name}</h5></Col>
                                                <Col><h5 className="font-weight-light">{item.value}</h5></Col>
                                            </Row>
                                        )
                                    })}
                                </div>
                            </Col>
                        </Row>
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
        getDeviceCount: (option) => {
            return dispatch(getDeviceCount(dispatch, option))
        },
        getDeviceDetails: (id) => {
            return dispatch(getDeviceDetails(dispatch, id))
        },
        updateSelectedDevice: (id) => {
            return dispatch(updateSelectedDevice(id))
        },
        getDataStats: (options) => {
            return dispatch(getDataStats(dispatch, options))
        },
        getActiveAlarmCount: () => {
            return dispatch(getActiveAlarmCount(dispatch))
        },
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
