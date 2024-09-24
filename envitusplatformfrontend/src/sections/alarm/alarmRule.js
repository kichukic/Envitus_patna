import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MdAddCircleOutline} from "react-icons/md";
import { Container, Modal, Button } from 'react-bootstrap';
import AlertBox from '../../components/alertBox/alertBox';
import Paginations from '../../components/paginations/paginations';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';
import AlarmruleEditForm from './alarmruleEditForm';
import { getAlarmruleCount, getAllAlarmrules, deleteAlarmrule } from '../../services/alarmApi';
import { map } from 'lodash';
import {toastr} from 'react-redux-toastr';

export class AlarmRule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showEditModal: false,
            updateType: '',
            updateAlarmruleId: '',
            updateAlarmruleList: false,
            table: {head: [], body: []},
            noAlarmrule: true,
            showOprn: true,
            showDeleteModal: false,
            showWarning: false,
            warningType: '',
            warningMsg: '',
            deleteAlarmruleId: '',
            offset: 0,
            limit: 5,
            alarmruleCount: '',
        }
        this.showAddAlarmruleModal = this.showAddAlarmruleModal.bind(this);
        this.showUpdatAlarmruleModal = this.showUpdatAlarmruleModal.bind(this);
        this.showDeletAlarmruleModal = this.showDeletAlarmruleModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.closeDeletAlarmruleModal = this.closeDeletAlarmruleModal.bind(this);
        this.deleteAlarmrule = this.deleteAlarmrule.bind(this);
        this.pagnCallback = this.pagnCallback.bind(this);
    }

    componentDidMount() {
        this.getAlarmrules();
    }

    getAlarmrules = async() => {
        this.setState({noAlarmrule: true});
        const alarmruleCount = await this.props.getAlarmruleCount();
        const options = {limit: this.state.limit, offset: this.state.offset}
        const alarmrules = await this.props.getAllAlarmrules(options);
        const tableHead = ['Type', 'Rule Name' ,'Clearing Mode', 'Device Selected', 'Parameter Information', 
            'Rule Information', 'Operations'
        ];
        const tableBody = alarmrules.map((alarmrule) => {
            this.setState({noAlarmrule: false});
            const devices = alarmrule.info.deviceIds.map(device => {
                return <p key={device.deviceId}>{device.deviceId}</p>;
            });
            const paramInfos = map(alarmrule.info.paramDefs, (value) => {
                return <p key={value.displayName}>{value.displayName} : Min {value.minLimit}, Max {value.maxLimit}</p>
            })
            const alarmruleDetails = [alarmrule.type, alarmrule.ruleName, alarmrule.clearingMode,
                devices, paramInfos, alarmrule.message
            ];
            return alarmruleDetails;
        });
        this.setState({table: {head: tableHead, body: tableBody}, alarmruleCount: alarmruleCount.ruleCount})
    }

    showAddAlarmruleModal(){
        this.setState({
            showEditModal: true,
            updateType: 'add',
            updateAlarmruleId: '',
            updateAlarmruleList: false 
        });
    }
    
    showUpdatAlarmruleModal(id){
        this.setState({
            showEditModal: true,
            updateType: 'update',
            updateAlarmruleId: id,
            updateAlarmruleList: false 
        });
    }

    closeEditModal() {
        this.setState({
            showEditModal: false,
            updateAlarmruleList: true
        });
        this.getAlarmrules(); 
    }

    showDeletAlarmruleModal(id){
        this.setState({
            showDeleteModal: true,
            deleteAlarmruleId: id
        });
    }

    closeDeletAlarmruleModal() {
        this.setState({
            showDeleteModal: false,
            updateAlarmruleList: true,
            showWarning: false
        });
    }

    viewAlarmruleDetails() {
        toastr.error('Oops !!', 'You cant view Alarm Rule Details');
    }

    async deleteAlarmrule(e) {
        e.preventDefault();
        try {
            const status = await this.props.deleteAlarmrule({ruleName: this.state.deleteAlarmruleId});
            if (!status) {
                this.setState({
                    showWarning: true,
                    warningType: 'warning',
                    warningMsg: 'Some error Occured'
                });
            } else {
                this.setState({
                    showWarning: true,
                    warningType: 'success',
                    warningMsg: 'Alarmrule deleted successfully'
                });
            }
        } catch(err) {
            this.setState({
                showWarning: true,
                warningType: 'danger',
                warningMsg: 'Some error Occured'
            });
        }
        this.getAlarmrules(); 
    }

    pagnCallback(newOffset) {
        this.setState({offset: newOffset});
        this.getAlarmrules();
    }

    render() {
        const alignLeft = true;
        return (
            <React.Fragment>
                <Container responsive="sm" className="container py-4">
                    <h2>Alarm Rule <MdAddCircleOutline onClick={this.showAddAlarmruleModal}/></h2>
                    {this.state.noAlarmrule && <p className="lead">No Alarm Rule Present</p>}
                    <LiveDataTable tableBody={this.state.table.body} tableHead={this.state.table.head} 
                        showOprn={this.state.showOprn} onEdit={this.showUpdatAlarmruleModal}
                        onDelete={this.showDeletAlarmruleModal} onView={this.viewAlarmruleDetails}
                        alignLeft={alignLeft}
                    />
                    {Boolean(this.state.alarmruleCount) &&
                        <Paginations userCount={this.state.alarmruleCount} limit={this.state.limit}
                            offset={this.state.offset} pagnCallback={this.pagnCallback}
                        />
                    }
                    { this.state.showEditModal && 
                        <AlarmruleEditForm 
                            show={this.state.showEditModal}
                            handleClose={this.closeEditModal}
                            updateAlarmruleId={this.state.updateAlarmruleId}
                            updateType={this.state.updateType}
                        /> 
                    }
                </Container>
                <Modal show={this.state.showDeleteModal} onHide={this.closeDeletAlarmruleModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Are sure want to delete Alarmrule?</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                        <AlertBox show={this.state.showWarning}
                            variant={this.state.warningType}
                            text={this.state.warningMsg}
                        />
                        <Button variant="secondary" onClick={this.closeDeletAlarmruleModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={this.deleteAlarmrule}>
                            Confirm
                        </Button>
                    </Modal.Footer>
                </Modal>
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
        getAllAlarmrules: (options) => {
            return dispatch(getAllAlarmrules(dispatch, options))
        },
        getAlarmruleCount: () => {
            return dispatch(getAlarmruleCount(dispatch))
        },
        deleteAlarmrule: (data) => {
            return dispatch(deleteAlarmrule(dispatch, data))
        }  
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(AlarmRule);
