import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getDataStats, getDataStatsCount } from '../../services/dataStatsApi';
import { checkPrerequisite, formatCsv } from '../../utils/csvDownloadPrereq';
import ChartTableCsv from '../../components/chartTableCsv/chartTableCsv';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';
import RadioGroup from '../../components/radioGroup/radioGroup';
import FormSelect from '../../components/formInputs/formSelect';
import FormDate from '../../components/formInputs/formDate';
import LineGraph from '../../components/graphs/lineGraph';
import AlertBox from '../../components/alertBox/alertBox';
import { getDisplayName, getFirstDisplayParamName, getParamDefint, getParams } from '../../utils/paramSelection';
import { find } from 'lodash';
import {toastr} from 'react-redux-toastr';
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import { Col } from 'react-bootstrap';

export class DataStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataStatsTable : [],
            dataStatsChart : [],
            dataStatsCumilTable: [],
            dataStatsChartInt: [],
            wrStatsChart: [],
            tableParamShown: [''],
            timeFrame: 'daily',
            csvReadyToDownload: false,
            startDate: '',
            endDate: '',
            csvDownloadData: [],
            radioMinMaxShown:[0, 1, 2],
            chartShown: true,
            chartParamSelected : '',
            showIntervalIps: false,
            showIntervalChart: false,
            intStartDate: '',
            intEndDate: '',
            getPassToIntChart: false,
            showWarning: false,
            warningType: '',
            warningMsg: '',
            graphYAxis: '',
            refreshData: '',
            needSpecific: false,
            offset: 0,
            limit: 10,
            dataCount: '',
        };

        this.doRefreshData = this.doRefreshData.bind(this);
        this.pagnCallback = this.pagnCallback.bind(this);
        this.timeFrameHandleChange = this.timeFrameHandleChange.bind(this);
        this.csvDateHandleChange = this.csvDateHandleChange.bind(this);
        this.clickAccordionToogle = this.clickAccordionToogle.bind(this);
        this.chartParamSelectHandleChange = this.chartParamSelectHandleChange.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedDevice) {
            this.initState();
            this.doRefreshData();
        }
    }

    componentDidUpdate = async(prevProps) => {
        if (prevProps.selectedDevice !== this.props.selectedDevice) {
            this.initState();
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshData);
    }

    doRefreshData() {
        this.setState({refreshData: setInterval(
            () => {
                this.initState();
            }, (15 * (60 * 1000))
        )})
    }

    initState = () => {
        const tableParamShown = [];
        tableParamShown.push(getFirstDisplayParamName(this.props.selectedDeviceData,
            ["Time", "Raw AQI", "Last Updated At"])
        );
        const needSpecific = this.props.selectedDeviceData.paramDefinitions.some(param => param.needSpecific);
        const selParamDefintn = getParamDefint(this.props.selectedDeviceData, tableParamShown[0]);
        this.setState({
            tableParamShown: tableParamShown, chartParamSelected: tableParamShown[0], needSpecific: needSpecific,
            graphYAxis: (selParamDefintn.graphDisplayName) ? selParamDefintn.graphDisplayName : selParamDefintn.displayName}, () => {
            this.updateDataStats();
            this.fetchDataForIntervalChart()
        })
    }

    chartParamSelectHandleChange = (event) => {
        const value = event.target.value;
        if(!(this.state.tableParamShown.includes(value))) {
            this.setState((state) => ({tableParamShown: state.tableParamShown.push(value)}, () => {}))
        }
        const selParamDefintn = getParamDefint(this.props.selectedDeviceData, value);
        this.setState({chartParamSelected: value,
            graphYAxis: (selParamDefintn.graphDisplayName) ? selParamDefintn.graphDisplayName : selParamDefintn.displayName}, () => {
            this.updateDataStats();
            this.fetchDataForIntervalChart();
        });
    }

    tableParamShownHandleChange = (val) => {
        this.setState({showWarning: false})
        if(val.length === 0) {
            toastr.error('Oops !!', 'Select Atleast 1 Parameter !!');
        } else {
            this.setState({tableParamShown: val}, () => {
                if(this.state.tableParamShown.includes(this.state.chartParamSelected)) {
                    this.updateDataStats();
                    this.fetchDataForIntervalChart();
                } else {
                    this.setState((state) => ({chartParamSelected: state.tableParamShown[0]}))
                    this.updateDataStats();
                    this.fetchDataForIntervalChart();
                }
            });
        }
    };

    timeFrameHandleChange = (event) => {
        this.setState({timeFrame: event.target.value},
            () => {
                this.updateDataStats();
                this.fetchDataForIntervalChart();
            });
    }

    radioMinMaxShownHandleChange = (val) => {
        this.setState({radioMinMaxShown: val},
            () => {
                this.updateDataStats();
                if(this.state.showIntervalChart) {
                    this.fetchDataForIntervalChart();
                }
            });
    }

    clickAccordionToogle = (event) => {
        if(event === 'chart') {
            this.setState({chartShown: !this.state.chartShown, showWarning: false});
        } else {
            this.setState({chartShown: false, showWarning: false});
        }
    }

    chartModeHandleChange = (event) => {
        if(event.target.value === 'interval') {
            this.setState({showIntervalIps: true, showWarning: false});
        } else {
            this.setState({showIntervalIps: false, showIntervalChart: false, showWarning: false});
        }
    }

    intModeIpChanges = (event) => {
        this.setState({[(event.target.name === 'startDate') ? 'intStartDate': 'intEndDate']
        : event.target.value, showWarning: false})
    }

    getPassGenIntChart = () => {
        this.setState({getPassToIntChart: true}, () => this.fetchDataForIntervalChart());
    }

    fetchDataForIntervalChart = async () => {
        if(this.state.getPassToIntChart) {
            const preRequisite = checkPrerequisite(this.state.intStartDate, this.state.intEndDate, 3, true, this.state.timeFrame);
            if(preRequisite.returnValue === 0) {
                toastr.error('Oops !!', preRequisite.warningMsg);
            }

            this.setState({showIntervalChart: true}, async () => {
                const numOfParam = this.state.tableParamShown.length;
                const indexParam = this.state.tableParamShown.join(",");
                const limit = (this.state.timeFrame === 'hourly') ? (numOfParam * 2976) : (this.state.timeFrame === 'daily') ?
                    (numOfParam * 124) : (this.state.timeFrame === 'monthly') ? (numOfParam * 6) : (numOfParam * 5);

                const options = {
                    deviceIds: this.props.selectedDeviceData.deviceId,
                    limit: limit,
                    offset: 0,
                    timeStart: preRequisite.epochStartDate,
                    timeEnd: preRequisite.epochEndDate,
                    timeFrame: this.state.timeFrame,
                    params: indexParam
                };

                const dataStats = await this.props.getDataStats(options);
                let statDataStats = dataStats.stat;

                const timeFm = Object.getOwnPropertyNames( statDataStats )[0];
                statDataStats = statDataStats[timeFm];

                if(this.state.timeFrame === 'hourly') {
                    statDataStats = statDataStats.filter((data) => {
                        return Math.abs(statDataStats[0].key - data.key) < (24 * 60 * 60 * 1000)
                    })
                }
                if(statDataStats.length === 0) {
                    const notFound = <div className="text-center">
                        <img style={{margin: '6%'}} src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
                        <br/><strong className="lead">No Data !!</strong></div>
                    this.setState({dataStatsChartInt: notFound})
                } else {
                    this.generateDataStatsChart(statDataStats, 'interval');
                }
            })
        }
    }

    updateDataStats = async() => {
        const tableParamShown = this.state.tableParamShown;
        const specificParam = [];
        this.props.selectedDeviceData.paramDefinitions.forEach(param => {
            if(param.needSpecific) {
                specificParam.push(param.paramName);
            } else if(param.paramName === 'windSpeedAvg') {
                specificParam.push('windSpeedAvg');
            }
        });
        const apicallParams = [...tableParamShown, ...specificParam]
        const indexParam = apicallParams.join(',');

        const countOption = {
            deviceIds: this.props.selectedDeviceData.deviceId,
            timeFrame: this.state.timeFrame,
            params: tableParamShown[0]
        };
        const dataCount = await this.props.getDataStatsCount(countOption);
        this.setState({dataCount: dataCount});

        const options = {
            deviceIds: this.props.selectedDeviceData.deviceId,
            limit: apicallParams.length * this.state.limit,
            offset: this.state.offset,
            timeFrame: this.state.timeFrame,
            timeStart: null,
            timeEnd: null,
            params: indexParam
        };
        const dataStats = await this.props.getDataStats(options);
        if(dataStats) {
            let statDataStats = dataStats.stat;
            const timeFm = Object.getOwnPropertyNames( statDataStats )[0];
            statDataStats = statDataStats[timeFm];

            if(this.state.timeFrame === 'hourly') {
                statDataStats = statDataStats.filter((data) => {
                    return Math.abs(statDataStats[0].key - data.key) < (24 * 60 * 60 * 1000)
                })
            }
            if(statDataStats.length !== 0) {
                this.generateDataStatsTable(statDataStats);
                this.generateDataStatsChart(statDataStats, 'normal');
            } else {
                const notFound = <div className="text-center" style={{marginTop: '10%'}}>
                    <img style={{margin: '6%'}} src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
                    <br/><strong className="lead">No Data !!</strong></div>
                this.setState({dataStatsTable: notFound, dataStatsChart: notFound,
                    dataStatsCumilTable: notFound, wrStatsChart: notFound
                })
            }
        }
    }

    generateDataStatsTable = (statDataStats) => {
        const tableHead = ['Date', 'Parameter', 'Sample Count' ,'Min', 'Avg', 'Max'];
        const cumilTableHead = ['Date', 'Parameter', 'Sample Count' ,'Sum'];
        const tableBody = []; const cumilTableBody= []; const alignLeft = true;

        statDataStats.forEach((element) => {
            if(element.statParams.count !== '') {
                let dateKey;
                if(this.state.timeFrame === 'hourly') {
                    dateKey = new Date(element.key).toLocaleString();
                } else {
                    dateKey = element.key;
                }

                const paramDef = find(this.props.selectedDeviceData.paramDefinitions, { 'paramName': element.paramName })
                const needCumil = Boolean(paramDef.needCumil);

                if(needCumil) {
                    const content = [dateKey, element.paramName, element.statParams.count, element.statParams.sum]
                    cumilTableBody.push(content);
                } else if (paramDef.valueType === "string") {
                    const content = [dateKey, element.paramName, element.statParams.count, element.statParams.latestValue, '','']
                    tableBody.push(content);
                } else {
                    const content = [
                        dateKey, element.paramName, element.statParams.count,
                        (element.statParams.min !== null) ? element.statParams.min.toFixed(2) : 'NULL',
                        (element.statParams.sum !== null) ? (element.statParams.sum/element.statParams.count).toFixed(2) : 'NULL',
                        (element.statParams.max !== null) ? element.statParams.max.toFixed(2) : 'NULL'
                    ]
                    tableBody.push(content);
                }
            }

        });

        const dataStatsTable = <LiveDataTable tableBody={tableBody} tableHead={tableHead} alignLeft={alignLeft}/>;
        this.setState({dataStatsTable:dataStatsTable});

        const dataStatsCumilTable = <LiveDataTable tableBody={cumilTableBody} tableHead={cumilTableHead} alignLeft={alignLeft}/>;
        this.setState({dataStatsCumilTable:dataStatsCumilTable});
    }

    generateDataStatsChart = (statDataStats, chart) => {
        const selParamDetails = [];
        statDataStats.forEach(element => {
            if(element.paramName === this.state.chartParamSelected) {
                selParamDetails.push(element);
            }
        });

        const graphDatas = []; let min = []; let avg = []; let max = []; let date = [];
        const minMaxAvgFullVal = [];

        selParamDetails.forEach(element => {
            if(element.statParams.count !== '') {
                minMaxAvgFullVal.push(element.statParams.min);
                minMaxAvgFullVal.push(element.statParams.sum/element.statParams.count);
                minMaxAvgFullVal.push(element.statParams.max);

                if(this.state.radioMinMaxShown.includes(0)) {
                    min.push(element.statParams.min);
                }
                if(this.state.radioMinMaxShown.includes(1)) {
                    avg.push(element.statParams.sum/element.statParams.count);
                }
                if(this.state.radioMinMaxShown.includes(2)) {
                    max.push(element.statParams.max);
                }
                if(this.state.timeFrame === 'hourly') {
                    date.push(new Date(element.key).toLocaleTimeString());
                } else {
                    date.push(element.key);
                }
            }
        });

        min = min.reverse(); avg = avg.reverse(); max = max.reverse(); date = date.reverse();

        const tempArray = [];
        tempArray.push({name: 'Min', val: min}); tempArray.push({name: 'Avg', val: avg});
        tempArray.push({name: 'Max', val: max});

        tempArray.forEach(element => {
            const parameterObject = {
                name: element.name,
                value: element.val,
                dates: date
            };
            graphDatas.push(parameterObject);
        })

        let key = Math.floor(Math.random() * 100); const isDataStats = true;
        const dataChart =
            <React.Fragment key={key++}>
                <br />
                <LineGraph graphDatas={graphDatas} isDataStats={isDataStats} yAxisName={this.state.graphYAxis}
                    minMaxAvgFullVal={minMaxAvgFullVal} timeFrame={this.state.timeFrame}
                />
            </React.Fragment>

        if(chart === 'normal') {
            const dataStatsChart = [dataChart];
            this.setState({dataStatsChart:dataStatsChart});
        } else if(chart === 'interval') {
            const dataStatsChartInt = [dataChart];
            this.setState({dataStatsChartInt:dataStatsChartInt});
        }

        const windPr = find(statDataStats, { 'paramName': 'windSpeedAvg' })
        if(windPr) {
            const windData = statDataStats.filter((data) => { return data.paramName === 'windSpeedAvg'})
            const wrPreOptions = {
                chart: { polar: true, type: 'column' },
                title: { text: 'Wind Rose Diagram'},
                pane: { size: '85%' },
                legend: { align: 'right', verticalAlign: 'top', y: 100, layout: 'vertical' },
                xAxis: {
                    tickmarkPlacement: 'on',
                    categories: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW",
                        "WSW", "W", "WNW", "NW", "NNW"
                    ]
                },
                yAxis: {
                    min: 0, endOnTick: false, showLastLabel: true,
                    title: {
                        text: 'Frequency (%)'
                    },
                    labels: {
                        formatter: function () {
                            return this.value + '%';
                        }
                    },
                    reversedStacks: false
                },
                tooltip: { valueSuffix: '%' },
                plotOptions: {
                    series: {
                        stacking: 'normal',
                        shadow: false,
                        groupPadding: 0,
                        pointPlacement: 'on'
                    }
                }
            }

            const windChart = [];
            windData.forEach(data => {
                if(data.detailedStat.count !== '') {
                    const windAvg = {...data.detailedStat.allValue}
                    const series = [{name: 'Calm', data: []}, {name: 'Light Air', data: []},
                        {name: 'Light Breeze', data: []}, {name: 'Gentle Breeze', data: []},
                        {name: 'Moderate Breeze', data: []}, {name: 'Fresh Breeze', data: []},
                        {name: 'Strong Breeze', data: []}, {name: 'Near Gale', data: []},
                        {name: 'Gale', data: []}, {name: 'Strong Gale', data: []},
                        {name: 'Storm', data: []}, {name: 'Violent Storm', data: []},
                        {name: 'Hurricane', data: []}
                    ];
                    for (const key1 of Object.keys(windAvg)) {
                        const cm = (windAvg[key1]['Calm'] === '') ? 0 : windAvg[key1]['Calm'].length;
                        const la =(windAvg[key1]['Light Air'] === '') ? 0 : windAvg[key1]['Light Air'].length;
                        const lb = (windAvg[key1]['Light Breeze'] === '') ? 0 : windAvg[key1]['Light Breeze'].length;
                        const gb = (windAvg[key1]['Gentle Breeze'] === '') ? 0 : windAvg[key1]['Gentle Breeze'].length;
                        const mb = (windAvg[key1]['Moderate Breeze'] === '') ? 0 : windAvg[key1]['Moderate Breeze'].length;
                        const fb = (windAvg[key1]['Fresh Breeze'] === '') ? 0 : windAvg[key1]['Fresh Breeze'].length;
                        const sb = (windAvg[key1]['Strong Breeze'] === '') ? 0 : windAvg[key1]['Strong Breeze'].length;
                        const ng = (windAvg[key1]['Near Gale'] === '') ? 0 : windAvg[key1]['Near Gale'].length;
                        const gl = (windAvg[key1]['Gale'] === '') ? 0 : windAvg[key1]['Gale'].length;
                        const sg = (windAvg[key1]['Strong Gale'] === '') ? 0 : windAvg[key1]['Strong Gale'].length;
                        const st = (windAvg[key1]['Storm'] === '') ? 0 : windAvg[key1]['Storm'].length;
                        const vs = (windAvg[key1]['Violent Storm'] === '') ? 0 : windAvg[key1]['Violent Storm'].length;
                        const hr = (windAvg[key1]['Hurricane'] === '') ? 0 : windAvg[key1]['Hurricane'].length;

                        series[0].data.push((cm * 100) / data.detailedStat.count);
                        series[1].data.push((la * 100) / data.detailedStat.count);
                        series[2].data.push((lb * 100) / data.detailedStat.count);
                        series[3].data.push((gb * 100) / data.detailedStat.count);
                        series[4].data.push((mb * 100) / data.detailedStat.count);
                        series[5].data.push((fb * 100) / data.detailedStat.count);
                        series[6].data.push((sb * 100) / data.detailedStat.count);
                        series[7].data.push((ng * 100) / data.detailedStat.count);
                        series[8].data.push((gl * 100) / data.detailedStat.count);
                        series[9].data.push((sg * 100) / data.detailedStat.count);
                        series[10].data.push((st * 100) / data.detailedStat.count);
                        series[11].data.push((vs * 100) / data.detailedStat.count);
                        series[12].data.push((hr * 100) / data.detailedStat.count);
                    }

                    HighchartsMore(Highcharts)
                    const text = (this.state.timeFrame === 'hourly') ? new Date(data.key).toLocaleString():
                        data.key;
                    const wrOptions = {...wrPreOptions , ...{
                        subtitle: { text: text},
                        series: series
                    }}
                    windChart.push(
                        <Col sm={6} key={data.key} >
                            <HighchartsReact highcharts={Highcharts} options={wrOptions} />
                        </Col>
                    )
                }
            })

            this.setState({wrStatsChart:windChart});
        }
    }

    csvDateHandleChange = (event) => {
        this.setState({[event.target.name]: event.target.value, showWarning: false});
    }

    csvInitDownload = async() => {
        const preRequisite = checkPrerequisite(this.state.startDate, this.state.endDate, 90, true);

        if(preRequisite.returnValue === 0) {
            toastr.error('Oops !!', preRequisite.warningMsg);
        }
        const paramObj = getParams(this.props.selectedDeviceData);
        const numOfParam = paramObj.count; const indexParam = paramObj.params;
        const limit = (this.state.timeFrame === 'hourly') ? (numOfParam * 2976) : (this.state.timeFrame === 'daily') ?
            (numOfParam * 124) : (this.state.timeFrame === 'monthly') ? (numOfParam * 6) : (numOfParam * 5);

        const options = {
            deviceIds: this.props.selectedDeviceData.deviceId,
            limit: limit,
            offset: 0,
            timeStart: preRequisite.epochStartDate,
            timeEnd: preRequisite.epochEndDate,
            timeFrame: this.state.timeFrame,
            params: indexParam
        };

        let csvDownloadData = await this.props.getDataStats(options);
        csvDownloadData = csvDownloadData.stat;
        const formatedCsvData = formatCsv(csvDownloadData, true, this.props.selectedDeviceData)
        if (formatedCsvData.length === 0) {
            toastr.error('Oops !!', 'No Data Present On this Date for the Device');
        } else {
            this.setState({csvReadyToDownload: true, csvDownloadData: formatedCsvData});
        }
    }

    setReadyToDownloadFalse = () => {
        this.setState({csvReadyToDownload: false});
    }

    pagnCallback(newOffset) {
        this.setState({offset: newOffset});
        this.updateDataStats();
    }

    render() {
        const indexTable= [];
        const indexChart= [];
        const style = {
            color:'$base-hover-color', borderColor:'$base-hover-color'
        }

        if(this.props.selectedDeviceData) {
            const displayNames = getDisplayName(this.props.selectedDeviceData, ["time", "rawAQI", "receivedTime"], true);
            const displayNameArray = displayNames.displayNameArray;
            const displayParamNameArray = displayNames.displayParamNameArray;

            displayNameArray.shift(); displayParamNameArray.shift();

            for (let pos = 0; pos < displayNameArray.length; pos++) {
                if(!displayNames.needSpecific[pos]){
                    const element = {
                        params: displayNameArray[pos],
                        value: displayParamNameArray[pos]
                    }
                    if (displayParamNameArray[pos] === "prominentPollutant" || displayParamNameArray[pos] === "GPS") {
                        continue;
                    }
                    indexTable.push(element);
                    indexChart.push(element);
                }
            }
        }

        const radioGroupDSTable =
        <RadioGroup radioShown={this.state.tableParamShown} index={indexTable}
            radioShownHandleChange={this.tableParamShownHandleChange}
        />

        const formSelectDSChart =
        <FormSelect selectValue={this.state.chartParamSelected} index={indexChart} style={style}
            selectValueHandleChange={this.chartParamSelectHandleChange}
        />

        const indexMinMax= [{params: 'Min', value: 0}, {params: 'Avg', value: 1},
            {params: 'Max', value: 2}
        ];

        const radioGroupDSMinMax =
        <RadioGroup radioShown={this.state.radioMinMaxShown} radioShownHandleChange={this.radioMinMaxShownHandleChange}
            index={indexMinMax}
        />

        const indexTimeFrame= [{params: 'Hourly', value: 'hourly'}, {params: 'Daily', value: 'daily'},
            {params: 'Monthly', value: 'monthly'}, {params: 'Yearly', value: 'yearly'}
        ];

        const formSelectDSTimeFrm =
        <FormSelect selectValue={this.state.timeFrame} index={indexTimeFrame} style={style}
            selectValueHandleChange={this.timeFrameHandleChange}
        />

        const indexChartMode= [{params: 'Normal Mode', value: 'normal'},
            {params: 'Interval Mode', value: 'interval'}
        ];

        const formSelectDSChartMode =
        <FormSelect selectValueHandleChange={this.chartModeHandleChange} index={indexChartMode}
            style={style}
        />

        const formDateDSIntMode =
        <FormDate dateInputChange={this.intModeIpChanges} dateSubmit={this.getPassGenIntChart} />

        const alertMessage =
        <AlertBox show={this.state.showWarning} variant={this.state.warningType}
            text={this.state.warningMsg}
        />

        const isDataStats = true;

        return (
            <div>
                <ChartTableCsv isDataStats={isDataStats} table={this.state.dataStatsTable} radioGroupDSTable={radioGroupDSTable}
                    timeFrame={this.state.timeFrame} chart={this.state.dataStatsChart} formDateDSIntMode={formDateDSIntMode}
                    timeFrameHandleChange={this.timeFrameHandleChange} csvReadyToDownload={this.state.csvReadyToDownload}
                    csvDateHandleChange={this.csvDateHandleChange} csvDownloadData={this.state.csvDownloadData}
                    csvInitDownload={this.csvInitDownload} alertMessage={alertMessage} radioGroupDSMinMax={radioGroupDSMinMax}
                    csvFilename="dataStats.csv" chartInt={this.state.dataStatsChartInt} initState={this.initState}
                    setReadyToDownloadFalse={this.setReadyToDownloadFalse} clickAccordionToogle={this.clickAccordionToogle}
                    chartShown={this.state.chartShown} formSelectDSChart={formSelectDSChart} formSelectDSTimeFrm={formSelectDSTimeFrm}
                    formSelectDSChartMode={formSelectDSChartMode} showIntervalIps={this.state.showIntervalIps}
                    showIntervalChart={this.state.showIntervalChart} needSpecific={this.state.needSpecific}
                    cumilTable={this.state.dataStatsCumilTable} dataCount={this.state.dataCount} limit={this.state.limit}
                    offset={this.state.offset} pagnCallback={this.pagnCallback} wrStatsChart={this.state.wrStatsChart}
                />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        dashBoardData: state.liveData.dashBoard,
        selectedDevice: state.devices.selectedDevice,
        selectedDeviceData: state.devices.data[state.devices.selectedDevice]
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        getDataStats: (options) => {
            return dispatch(getDataStats(dispatch, options))
        },
        getDataStatsCount : (options) => {
            return dispatch(getDataStatsCount(dispatch, options))
        }
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DataStats);
