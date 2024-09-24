import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getDashboardData, getDashboardDataCount } from '../../services/liveDataApi';
import { checkPrerequisite, formatCsv } from '../../utils/csvDownloadPrereq';
import ChartTableCsv from '../../components/chartTableCsv/chartTableCsv';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';
import RadioGroup from '../../components/radioGroup/radioGroup';
import LineGraph from '../../components/graphs/lineGraph';
import { getDisplayNameAndValue, getFirstDisplayParamName, getDisplayName } from '../../utils/paramSelection';
import AlertBox from '../../components/alertBox/alertBox';
import { capitalize } from '../../utils/index';
import {toastr} from 'react-redux-toastr';

export class RawData extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rawDataTable: [],
            rawDataChart: [],
            csvReadyToDownload: false,
            startDate: '',
            endDate: '',
            csvDownloadData: [],
            chartParamShown: [''],
            showWarning: false,
            warningType: '',
            warningMsg: '',
            refreshData: '',
            offset: 0,
            limit: 10,
            dataCount: '',
        };

        this.doRefreshData = this.doRefreshData.bind(this);
        this.csvDateHandleChange = this.csvDateHandleChange.bind(this);
        this.pagnCallback = this.pagnCallback.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedDevice) {
            this.initState();
            this.doRefreshData();
        }
    }

    componentDidUpdate = async (prevProps) => {
        if (prevProps.selectedDevice !== this.props.selectedDevice) {
            this.initState();
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshData);
    }

    doRefreshData() {
        this.setState({
            refreshData: setInterval(
                () => {
                    this.initState();
                }, (15 * (60 * 1000))
            )
        })
    }

    clickAccordionToogle = () => {
        this.setState({ showWarning: false });
    }

    initState = () => {
        const chartParamShown = [];
        chartParamShown.push(getFirstDisplayParamName(this.props.selectedDeviceData,
            ["Time", "Raw AQI"]));
        this.setState({ chartParamShown: chartParamShown })
        this.updateRawData();
    }

    updateRawData = async () => {
        const countOption = { deviceIds: this.props.selectedDeviceData.logicalDeviceId };
        const dataCount = await this.props.getDashboardDataCount(countOption);
        this.setState({ dataCount: dataCount });
        const options = {
            deviceIds: this.props.selectedDeviceData.logicalDeviceId,
            limit: this.state.limit,
            offset: this.state.offset,
            timeStart: null,
            timeEnd: null,
        };
        const rawDataValue = await this.props.getDashboardData(options);
        if (rawDataValue && rawDataValue.length !== 0) {
            this.generateRawDataTable(rawDataValue);
            this.generateRawDataChart(rawDataValue);
        } else {
            const notFound = <div className="text-center">
                <img style={{margin: '6%'}} src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
                <br/><strong className="lead">No Data !!</strong></div>
            this.setState({rawDataTable: notFound, rawDataChart: notFound})
        }
    }

    generateRawDataTable = (rawDataValue) => {
        const tableContent = getDisplayNameAndValue(rawDataValue, this.props.selectedDeviceData,
            ["AQI", "prominentPollutant"]
        );

        const tableHead = tableContent.displayNamesObject.displayNameArray;
        const tableBody = tableContent.displayValueArray;
        const alignLeft = true;
        
        const rawDataTable = <LiveDataTable tableBody={tableBody} tableHead={tableHead} alignLeft={alignLeft}/>;
        this.setState({rawDataTable:rawDataTable});
    }

    generateRawDataChart = (rawDataValue) => {
        rawDataValue = rawDataValue.reverse()
        const chartParamShown = this.state.chartParamShown;

        const graphDatas = [];
        chartParamShown.forEach(parameter => {
            const parameterValue = [];
            const dates = [];
            let prevDate;
            rawDataValue.forEach(element => {
                parameterValue.push(element.data[parameter]);
                const date = new Date(element.data.receivedTime)
                if (prevDate && (prevDate === date.toLocaleDateString())) {
                    dates.push(date.toLocaleTimeString());
                } else {
                    let toLocaleString = date.toLocaleString();
                    toLocaleString = toLocaleString.replace(/.[0-9][0-9][0-9][0-9]/, '')
                    dates.push(toLocaleString);
                }
                prevDate = date.toLocaleDateString();
            });

            const parameterObject = {
                name: capitalize(parameter),
                value: parameterValue,
                dates: dates
            };

            graphDatas.push(parameterObject);
        })

        const rawDataChart = [];
        let key = Math.floor(Math.random() * 100);
        rawDataChart.push(
            <React.Fragment key={key++}>
                <LineGraph graphDatas={graphDatas} isDataStats={false} />
            </React.Fragment>
        );
        this.setState({ rawDataChart: rawDataChart });
    }

    csvDateHandleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value, showWarning: false });
    }

    csvInitDownload = async () => {
        const preRequisite = checkPrerequisite(this.state.startDate, this.state.endDate, 90, false);

        if(preRequisite.returnValue === 0) {
            toastr.error('Oops !!', preRequisite.warningMsg);
        }

        const options = {
            deviceIds: this.props.selectedDeviceData.logicalDeviceId,
            limit: 15000,
            offset: 0,
            timeStart: preRequisite.epochStartDate,
            timeEnd: preRequisite.epochEndDate
        };
        const csvDownloadData = await this.props.getDashboardData(options);
        const datas = {csvData: csvDownloadData, devData: this.props.selectedDeviceData}
        const formatedCsvData = formatCsv(datas, false)
        if (formatedCsvData.length === 0) {
            toastr.error('Oops !!', 'No Data Present On this Date for the Device');
        } else {
            this.setState({ csvReadyToDownload: true, csvDownloadData: formatedCsvData });
        }
    }

    setReadyToDownloadFalse = () => {
        this.setState({ csvReadyToDownload: false });
    }

    chartParamShownHandleChange = (val) => {
        if(val.length > 4) {
            toastr.error('Oops !!', 'Parameter Selection Limit Reached !!');
        } else if(val.length === 0) {
            toastr.error('Oops !!', 'Select Atleast one Parameter !!');
        } else {
            this.setState({ chartParamShown: val, showWarning: false });
        }
        this.updateRawData();
    };

    pagnCallback(newOffset) {
        this.setState({ offset: newOffset });
        this.updateRawData();
    }

    render() {
        const index = [];
        if(this.props.selectedDeviceData) {
            const displayNames = getDisplayName(this.props.selectedDeviceData, ["time", 
                "receivedTime", "AQI", "prominentPollutant", "GPS"], true);
            const displayNameArray = displayNames.displayNameArray;
            const displayParamNameArray = displayNames.displayParamNameArray;

            displayNameArray.shift(); displayParamNameArray.shift();

            for (let pos = 0; pos < displayNameArray.length; pos++) {
                const element = {
                    params: displayNameArray[pos],
                    value: displayParamNameArray[pos]
                }
                index.push(element);
            }
        }

        const radioGroupRDChart =
            <RadioGroup radioShown={this.state.chartParamShown} index={index}
                radioShownHandleChange={this.chartParamShownHandleChange}
            />

        const alertMessage =
            <AlertBox show={this.state.showWarning} variant={this.state.warningType}
                text={this.state.warningMsg}
            />

        return (
            <div>
                <ChartTableCsv isDataStats={false} table={this.state.rawDataTable} csvReadyToDownload={this.state.csvReadyToDownload}
                    csvDateHandleChange={this.csvDateHandleChange} csvInitDownload={this.csvInitDownload} csvFilename="rawData.csv"
                    radioGroupRDChart={radioGroupRDChart} csvDownloadData={this.state.csvDownloadData} alertMessage={alertMessage}
                    setReadyToDownloadFalse={this.setReadyToDownloadFalse} chart={this.state.rawDataChart} initState={this.initState}
                    clickAccordionToogle={this.clickAccordionToogle} dataCount={this.state.dataCount} limit={this.state.limit}
                    offset={this.state.offset} pagnCallback={this.pagnCallback}
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
        getDashboardData: (options) => {
            return dispatch(getDashboardData(dispatch, options))
        },
        getDashboardDataCount: (options) => {
            return dispatch(getDashboardDataCount(dispatch, options))
        }
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(RawData);
