/* eslint-disable react/no-danger */
import React from 'react';
import './dashboard.scss'
import { Container, Row, Col } from 'react-bootstrap';
import DonutChart from '../../components/donutChart/donutChart';
import { connect } from 'react-redux';
import { getSummary, getSummarySpec } from '../../services/liveDataApi';
import { getParamValueLimitIndex } from '../../utils/paramSelection';
class Dashboard extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            charts : []
        };
    }

    componentDidMount() {
        this.updateDashboardChart();
    }

    async updateDashboardChart() {
        const dashboardData = await this.props.getSummary();
        const summarySpec = await this.props.getSummarySpec();
        const charts = summarySpec.map((param) =>{
            if(dashboardData[0] && dashboardData[0][param.paramName] !== 'undefined') {
                const limitIndex = getParamValueLimitIndex(param.limits, dashboardData[0][param.paramName]);
                return (
                    <Col sm={3} className="db-column" key={param.paramName} >
                        <DonutChart
                            value={dashboardData[0][param.paramName]}
                            max={param.maxRanges.max}
                            min={param.maxRanges.min}
                            title={param.displayNameHtml}
                            unit={param.unitDisplayHtml}
                            color={param.limits[limitIndex].color}
                            icon={param.displayImage}
                        />
                        <div dangerouslySetInnerHTML={{__html: param.displayNameHtml}} />
                    </Col>
                );
            }
            return null;
        });
        this.setState({charts: charts});
    }

    render() {
        return (
            <Container className="container dshbrd-sumry" data-test="pbmsdashTag">
                <Row>
                    {this.state.charts}
                </Row>
            </Container>
        );

    }
}

export function mapStateToProps(state) {
    return ({
        dashBoardData: state.liveData.dashBoard
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        getSummary: () => {
            return dispatch(getSummary(dispatch))
        },
        getSummarySpec: () => {
            return dispatch(getSummarySpec(dispatch))
        }    
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
