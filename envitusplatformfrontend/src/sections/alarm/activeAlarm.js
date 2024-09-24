import React, { Component } from 'react';
import { connect } from 'react-redux';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';
import { getAllActiveAlarm, getActiveAlarmCount } from '../../services/alarmApi';
import { Container, Button } from 'react-bootstrap';
import Paginations from '../../components/paginations/paginations';
import { updateActiveAlarm } from '../../services/alarmApi';

export class ActiveAlarm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            table: {head: [], body: []},
            noActiveAlarm: true,
            showOprn: false,
            offset: 0,
            limit: 5,
            activeAlarmCount: '',
        }
        this.pagnCallback = this.pagnCallback.bind(this);
    }

    componentDidMount() {
        this.getActiveAlarms(); 
    }

    getActiveAlarms = async() => {
        this.setState({noActiveAlarm: true});
        const activeAlarmCount = await this.props.getActiveAlarmCount();
        const options = {limit: this.state.limit, offset: this.state.offset}
        const activeAlarms = await this.props.getAllActiveAlarm(options);
        const tableHead = ['Rule Name', 'Time Stamp', 'Cleared Time', 'Status' ,'Live Log'];
        const tableBody = activeAlarms.map((activeAlarm) => {
            const liveLog = activeAlarm.liveLog.map((log) => {
                const paramVals = [];
                Object.values(log.paramValues).forEach((param) => {
                    if(param.logs.length !== 0) {
                        const paramTs = new Date(param.logs[0].timeStamp).toLocaleString("en-US");
                        paramVals.push(param.displayName + '- ' + paramTs);
                    }
                })
                return <p key={log.deviceId}>{log.deviceId } : { paramVals.join(' : ') }</p>
            })
            const timestamp = new Date(activeAlarm.timeStamp).toLocaleString("en-US");
            let clearedtime;
            if(activeAlarm.clearedTime){
                clearedtime = new Date(activeAlarm.clearedTime).toLocaleString("en-US");
            } else {
                clearedtime = <Button onClick={()=> this.clearTime(activeAlarm)}>Clear Now</Button>
            }
            
            this.setState({noActiveAlarm: false});
            const activeAlarmDetails = [activeAlarm.ruleName, timestamp, clearedtime, 
                activeAlarm.alarmStatus, liveLog
            ];
            return activeAlarmDetails;
        });
        this.setState({table: {head: tableHead, body: tableBody}, activeAlarmCount: activeAlarmCount.recordCount})
    }

    async clearTime(activeAlarm) {
        const newObject = JSON.parse(JSON.stringify(activeAlarm));
        delete newObject.alarmTime;
        delete newObject.index;
        if(newObject.liveLog !== null) {
            for (let index = 0; index < newObject.liveLog.length; index++) {
                delete newObject.liveLog[index].uniqueId;
            }
        }
        newObject.alarmStatus = "NotActive";

        const status = await this.props.updateActiveAlarm(newObject);
        if(status) {
            this.getActiveAlarms(); 
        }
    }

    pagnCallback(newOffset) {
        this.setState({offset: newOffset});
        this.getActiveAlarms();
    }

    render() {
        const alignLeft = true;
        return (
            <React.Fragment>
                <Container responsive="sm" className="container py-4">
                    <h2>Active Alarms</h2>
                    {this.state.noActiveAlarm && <p className="lead">No Active Alarm Present</p>}
                    <LiveDataTable tableBody={this.state.table.body} tableHead={this.state.table.head} 
                        showOprn={this.state.showOprn} alignLeft={alignLeft}
                    />
                    {Boolean(this.state.activeAlarmCount) &&
                        <Paginations userCount={this.state.activeAlarmCount} limit={this.state.limit}
                            offset={this.state.offset} pagnCallback={this.pagnCallback}
                        />
                    }
                </Container>
            </React.Fragment>
        )
    }
}

function mapStateToProps(state) {
    return ({
        
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        getActiveAlarmCount: () => {
            return dispatch(getActiveAlarmCount(dispatch))
        },
        getAllActiveAlarm: (options) => {
            return dispatch(getAllActiveAlarm(dispatch, options))
        },
        updateActiveAlarm: (data) => {
            return dispatch(updateActiveAlarm(dispatch, data))
        },
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(ActiveAlarm);
