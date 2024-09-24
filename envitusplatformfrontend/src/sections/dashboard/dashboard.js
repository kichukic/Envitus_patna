/* eslint-disable react/no-danger */
import React from 'react';
import './dashboard.scss'
import { Container, Row, Col, Button } from 'react-bootstrap';
import Building from '../../components/building/building';
import SemiCircleChart from '../../components/semiCircleChart/semiCircleChart';
import { connect } from 'react-redux';
import { getParamValueLimitIndex } from '../../utils/paramSelection';
import { getDataStats } from '../../services/dataStatsApi';

export class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            charts : [],
            selectedDeviceName: '',
            lastUpdatedAt: '',
            refreshData: '',
        };
        this.doRefreshData = this.doRefreshData.bind(this);
    }

    componentDidMount() {
        if (this.props.selectedDevice) {
            this.updateDashboardChart();
            this.doRefreshData();
        }
    }

    async componentDidUpdate(prevProps) {
        if (prevProps.selectedDevice !== this.props.selectedDevice) {
            this.updateDashboardChart();
        }
    }

    componentWillUnmount() {
        clearInterval(this.state.refreshData);
    }

    doRefreshData() {
        this.setState({refreshData: setInterval(
            () => {
                this.updateDashboardChart();
            }, (15 * (60 * 1000))
        )})
    }

    async updateDashboardChart() {
        const options = {
            deviceIds: this.props.selectedDeviceData.deviceId,
            limit: this.props.selectedDeviceData.paramDefinitions.length,
            offset: 0,
            timeFrame: 'hourly',
            params: null
        };
        let dashboardData = await this.props.getDataStats(options);
       
        if(dashboardData) {
            dashboardData = dashboardData.stat.hourlyStat;
            const lastUpdatedAt = new Date(parseInt(dashboardData[0].key, 10)).toLocaleTimeString();
            const charts = this.props.selectedDeviceData.paramDefinitions.map((param) =>{
                const paramStats = dashboardData.find(element => element.paramName === param.paramName);
                if(param.isDisplayEnabled && param.paramName !== "receivedTime" && paramStats) {
                    const paramAvg = paramStats.statParams.sum/ paramStats.statParams.count
                    const limitIndex = getParamValueLimitIndex(param.limits, paramAvg);
                    return (
                        <Col sm={4} className="db-column" key={param.paramName} >
                            <SemiCircleChart
                                value={paramAvg}
                                max={param.maxRanges.max}
                                min={param.maxRanges.min}
                                title={param.displayNameHtml}
                                unit={param.unitDisplayHtml}
                                color={param.limits[limitIndex].color}
                            />
                            <div dangerouslySetInnerHTML={{__html: param.displayNameHtml}} />
                        </Col>
                    );
                }
                return null;
            });
            this.setState({
                charts: charts,
                selectedDeviceName: this.props.selectedDeviceData.deviceId + ', ' +this.props.selectedDeviceData.location.landMark,
                lastUpdatedAt: lastUpdatedAt
            });
        }
    }

    render() {
        return (
            <div data-test="maindashTag">
                <Building />
                <Container className="container">
                    <Row className="deivce-details">
                        <span className="left">Device: {this.state.selectedDeviceName}</span>
                        <span className="right">
                            <div>Last Updated At: {this.state.lastUpdatedAt}</div>
                            <Button className="w-100" onClick={this.updateDashboardChart}>
                                Refresh Data
                            </Button>   
                        </span>
                    </Row>
                    <Row>
                        {this.state.charts}
                    </Row>
                </Container>
            </div>);

    }
}

export function mapStateToProps(state) {
    return ({
        dashBoardData: state.liveData.dashBoard,
        selectedDevice: state.devices.selectedDevice,
        selectedDeviceData: state.devices.data[state.devices.selectedDevice]
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        getDataStats: (options) => {
            return dispatch(getDataStats(dispatch, options))
        },    
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
