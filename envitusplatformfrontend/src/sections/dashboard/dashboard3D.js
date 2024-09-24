/* eslint-disable react/no-danger */
import React from 'react';
import './dashboard.scss'
import { Container, Row, Col, Button } from 'react-bootstrap';
import Building3D from '../../components/building/building3D';
import SemiCircleChart from '../../components/semiCircleChart/semiCircleChart';
import { connect } from 'react-redux';
import { getDashboardData } from '../../services/liveDataApi';

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            charts : [],
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
            deviceIds: this.props.selectedDeviceData.logicalDeviceId,
            limit: 1,
            offset: 0
        };
        const dashboardData = await this.props.getDashboardData(options);
       
        const charts = this.props.selectedDeviceData.paramDefinitions.map((param) =>{
            if(param.isDisplayEnabled && param.paramName !== "receivedTime" && dashboardData[0] 
                && dashboardData[0].data[param.paramName]) {
                const limitIndex = this.getParamValueLimitIndex(param.limits, dashboardData[0].data[param.paramName]);
                return (
                    <Col sm={4} className="db-column" key={param.paramName} >
                        <SemiCircleChart
                            value={dashboardData[0].data[param.paramName]}
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
        this.setState({charts: charts});
    }

    getParamValueLimitIndex (limits, value) {
        if (limits != null && limits.length > 0 && value != null) {
            for (let i = 0; i < limits.length; i++) {
                if (limits[i].min != null && limits[i].max != null && value >= limits[i].min && value <= limits[i].max)
                {return i;}
                if (limits[i].min != null && limits[i].max == null && value >= limits[i].min)
                {return i;}
                if (limits[i].min == null && limits[i].max != null && value <= limits[i].max)
                {return i;}
            }
        }
        return -1;
    }

    render() {
        return (
            <div>
                <Building3D />
                <Container className="container">
                    <Row className="deivce-details">
                        <span className="right">
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
        }    
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
