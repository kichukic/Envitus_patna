import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Modal, Button, Row, Col, Form } from 'react-bootstrap';
import TpUserEditForm from './tpUserEditForm';
import { MdAddCircleOutline, MdDelete, MdRemoveCircleOutline } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { deleteTpUser, getTpUserCount, getAllTpUsers, updateTpUser } from '../../services/tpUserApi';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';
import DarkOverlays from '../../components/overlays/darkOverlays';
import Paginations from '../../components/paginations/paginations';
import {toastr} from 'react-redux-toastr';
import Loader from 'react-loader-spinner';
import './tpUser.scss';

export class TpUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offset: {act: 0, deact: 0},
            limit: 10,
            table: {activated: '', deactivated: '', actCnt: 0, deactCnt: 0},
            showEditModal: false,
            updateType: '',
            updateName: '',
            showDeleteModal: false,
            deleteName: '',
            modal: {head: '', content: {body: '', buttons: '', submitLink: ''}},
            apiCall: {restore: '', permanent: ''},
            deactivationReason: '',
            filter: {type: ['name'], option: {}},
            filterCurrent: {text: '', select: ''},
        }
        this.showAddModal = this.showAddModal.bind(this);
        this.showFilterModal = this.showFilterModal.bind(this);
        this.showUpdateModal = this.showUpdateModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.showTempDeleteModal = this.showTempDeleteModal.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.showRestoreModal = this.showRestoreModal.bind(this);
        this.viewUsrDetails = this.viewUsrDetails.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.filterChange = this.filterChange.bind(this);
        this.addFilter = this.addFilter.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
        this.pagnCallback = this.pagnCallback.bind(this);
    }

    async componentDidMount() {
        this.setTables();
    }

    showAddModal(){
        this.setState({
            showEditModal: true,
            updateType: 'add',
            updateName: '',
        });
    }

    showFilterModal() {
        const filterTable = {head: ['Filter', 'Condition', 'Remove'], body: []};
        for (const key of Object.keys(this.state.filter.option)) {
            const row = [key, this.state.filter.option[key], <MdDelete onClick={() => this.removeFilter(key)} className="oprnButton"/>]
            filterTable.body.push(row);
        }
        const input =
            <Row className="mb-3">
                <Col>
                    <select value={this.state.filterCurrent.select} onChange={this.filterChange} name="select"
                        className="form-control"
                    >
                        <option hidden value="">Select Filter</option>
                        {this.state.filter.type.map((val) => (<option key={val} value={val}>
                            {val}
                        </option>))}
                    </select>
                </Col>
                <Col className="d-flex justify-content-between">
                    <Form.Control type="text" name="text" onChange={this.filterChange}
                        className="mr-2" placeholder="Keyword" value={this.state.filterCurrent.text}
                    />
                    <h3><MdAddCircleOutline onClick={this.addFilter} className="oprnButton"/></h3>
                </Col>
            </Row>
        const showOprn = false; const alignLeft = false;
        const filter =
            <div>
                {(filterTable.body.length > 0) &&
                    <div className="mb-3">
                        <LiveDataTable tableBody={filterTable.body} tableHead={filterTable.head} showOprn={showOprn}
                            alignLeft={alignLeft}
                        />
                    </div>
                }
                {input}
            </div>
        const modalHead =
            <div className="d-flex justify-content-start">
                Apply Filter
                <summary>
                    <h3>
                        <DarkOverlays hovertext="Remove Filter" placement="bottom">
                            <MdRemoveCircleOutline className="ml-2 oprnButton" onClick={() => this.setTables()}/>
                        </DarkOverlays>
                    </h3>
                </summary>
            </div>
        this.setState({
            showDeleteModal: true,
            modal: {head: modalHead, content: {body: filter, buttons: true,
                submitLink: 'filterUser'}},
            apiCall: {restore: '', permanent: ''}
        });
    }

    addFilter() {
        if(this.state.filterCurrent.select && this.state.filterCurrent.text) {
            const filter = {...this.state.filter};
            const types = filter.type.filter(type => type !== this.state.filterCurrent.select);
            const option = {...filter.option, ...{[this.state.filterCurrent.select]: this.state.filterCurrent.text}}
            this.setState({filter: {type: types, option: option}, filterCurrent: {select: '', text: ''}},
                () => this.showFilterModal());
        } else {
            toastr.error('Oops !!', 'Select Both Filter and Keyword');
        }
    }

    removeFilter(select) {
        const filter = {...this.state.filter};
        const types = filter.type; types.push(select);
        const option = filter.option; delete option[select];
        this.setState({filter: {type: types, option: option}, filterCurrent: {select: '', text: ''}},
            () => this.showFilterModal());
    }

    filterChange(e) {
        if(e.target.name === 'select') {
            const text = this.state.filterCurrent.text;
            this.setState({filterCurrent: {select: e.target.value, text: text}}, () => this.showFilterModal());
        } else {
            const select = this.state.filterCurrent.select;
            this.setState({filterCurrent: {text: e.target.value, select: select}}, () => this.showFilterModal());
        }
    }

    async showUpdateModal(id) {
        this.setState({
            showEditModal: true,
            updateType: 'update',
            updateName: id,
        });
    }

    closeEditModal() {
        this.setState({showEditModal: false});
    }

    async showTempDeleteModal(id) {
        const input =
            <Form.Control type="text" onChange={this.handleChange} className="w-100 mb-3" placeholder="Reason For Deactivation" />
        this.setState({
            showDeleteModal: true,
            deleteName: id,
            modal: {head: 'Continue Deactivating the Key ?', content: {body: input, buttons: true,
                submitLink: 'restoDltUser'}},
            apiCall: {restore: false, permanent: false}
        });
    }

    showDeleteModal(id) {
        this.setState({
            showDeleteModal: true,
            deleteName: id,
            modal: {head: 'Continue Deleting the Key ?', content: {body: '', buttons: true,
                submitLink: 'restoDltUser'}},
            apiCall: {restore: false, permanent: true}
        });
    }

    showRestoreModal(id) {
        this.setState({
            showDeleteModal: true,
            deleteName: id,
            modal: {head: 'Continue Restoring the Key ?', content: {body: '', buttons: true,
                submitLink: 'restoDltUser'}},
            apiCall: {restore: true, permanent: ''}
        });
    }

    viewUsrDetails(id) {
        if((sessionStorage.getItem("userRole") === 'superAdmin' || sessionStorage.getItem("userRole") === 'Administrator')){
            const usrDet = <div><pre>{JSON.stringify(this.props.userList[id], null, 4)}</pre></div>
            this.setState({
                showDeleteModal: true,
                modal: {head: 'Name: ' + id, content: {body: usrDet, buttons: false,
                    submitLink: ''}},
                apiCall: {restore: '', permanent: ''}
            });
        } else {
            toastr.error('Oops !!', 'You dont have the permission this action');
        }
    }

    closeDeleteModal() {
        this.setState({ showDeleteModal: false, filter: {type: ['name'], option: {}},
            filterCurrent: {text: '', select: ''}});
    }

    async setTables() {
        const loader = <div className="text-center">
            <Loader type="MutatingDots" color="#00BFFF" height={100} width={100} />
            <br/><strong className="lead">Loading !!</strong></div>
        this.setState({table : {activated: loader , deactivated: loader, actCnt: 0, deactCnt: 0}});

        let extraOption = {};
        const filter = {...this.state.filter.option}; const array = ['name'];
        array.forEach(filt => {
            if(filter.hasOwnProperty(String(filt))) {
                extraOption = {...extraOption, ...{[filt]: this.state.filter.option[filt]}}
            } else {
                extraOption = {...extraOption, ...{[filt]: 'null'}}
            }
        })

        const usrCountAct = await this.props.getTpUserCount({...extraOption, ...{activated: true}});
        const usrCountDeact = await this.props.getTpUserCount({...extraOption, ...{activated: false}});
        const showOprn = true; const alignLeft = true; let activated; let deactivated;
        const notFound = <div className="text-center">
            <img src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
            <br/><strong className="lead">No Data !!</strong></div>

        if(usrCountAct > 0) {
            const tableHeadAct = ['Key', 'Name', 'Limit', 'Operation'];
            const usersAct = await this.props.getAllTpUsers({...extraOption,
                ...{limit: this.state.limit, offset: this.state.offset.act, activated: true}});
            const tableBodyAct = usersAct.map(api => {
                return([api.apikey, api.name, api.limit]);
            })
            activated =
                <LiveDataTable tableBody={tableBodyAct} tableHead={tableHeadAct} showOprn={showOprn}
                    onEdit={this.showUpdateModal} onDelete={this.showTempDeleteModal} alignLeft={alignLeft}
                    onView={this.viewUsrDetails}
                />;
        } else {
            activated = notFound;
        }

        if(usrCountDeact > 0) {
            const tableHeadDeact = ['Key', 'Name', 'Limit', 'Deact User', 'Deact Time', 'Reason', 'Operation'];
            const usersDeact = await this.props.getAllTpUsers({...extraOption,
                ...{limit: this.state.limit, offset: this.state.offset.deact, activated: false}});
            const tableBodyDeact = usersDeact.map(api => {
                const date = new Date(api.deactLog.date).toLocaleString("en-US");
                return([api.apikey, api.name, api.limit, api.deactLog.user,
                    date, api.deactLog.reason]);
            })
            const restore = true;
            deactivated =
                <LiveDataTable tableBody={tableBodyDeact} tableHead={tableHeadDeact} showOprn={showOprn}
                    onEdit={this.showUpdateModal} onDelete={this.showDeleteModal} alignLeft={alignLeft}
                    onView={this.viewUsrDetails} onRestore={this.showRestoreModal} restore={restore}
                />;
        } else {
            deactivated = notFound;
        }

        this.setState({table : {activated: activated , deactivated: deactivated, actCnt: usrCountAct, deactCnt: usrCountDeact}},
            () => this.closeDeleteModal())
    }

    async restoDltUser(e) {
        e.preventDefault();
        try {
            let status;
            if (this.state.apiCall.restore) {
                const usrDetails = {...this.props.userList[this.state.deleteName], ...{
                    activated: true,
                    deactLog: ""
                }};
                status = await this.props.updateTpUser(usrDetails);
            } else {
                if(this.state.apiCall.permanent) {
                    status = await this.props.deleteTpUser({uName: this.state.deleteName});
                } else {
                    const usrDetails = {...this.props.userList[this.state.deleteName], ...{
                        activated: false,
                        deactLog: {
                            user: sessionStorage.getItem("whoami"),
                            date: new Date().toISOString(),
                            reason: this.state.deactivationReason
                        }
                    }};
                    status = await this.props.updateTpUser(usrDetails)
                }
            }
            if (!status) {
                toastr.error('Oops !!', 'Some Error Occured');
            } else {
                const info = (this.state.apiCall.restore) ? 'Key Restored' :
                    (this.state.apiCall.permanent) ? 'Key Deleted' : 'Key Deactivated';
                toastr.success('Success !!', info);
            }
        } catch(err) {
            toastr.error('Oops !!', 'Some Error Occured');
        }
        this.setTables(); this.closeDeleteModal();
    }

    handleChange(event) {
        this.setState({deactivationReason: event.target.value})
    }

    pagnCallback(type, newOffset) {
        const sibling = (type === 'act') ? 'deact' : 'act'
        this.setState({offset: {[type]: newOffset, [sibling]: this.state.offset[sibling]}},
            () => this.setTables())
    }

    render() {
        const disableSwitch = (this.state.filter.option && (Object.keys(this.state.filter.option).length > 0)) ? false : true;
        return (
            <div className="pt-3">
                <Container>
                    <div className="d-flex justify-content-between">
                        <h2>Keys</h2>
                        <div>
                            <h2 className="d-flex justify-content-start">
                                <DarkOverlays hovertext="Filter" placement="bottom">
                                    <summary>
                                        <FiFilter className="oprnButton" onClick={this.showFilterModal}/>
                                    </summary>
                                </DarkOverlays>
                                <DarkOverlays hovertext="Add" placement="bottom">
                                    <summary>
                                        <MdAddCircleOutline className="oprnButton" onClick={this.showAddModal}/>
                                    </summary>
                                </DarkOverlays>
                            </h2>
                        </div>
                    </div>
                    {this.state.table.activated}
                    <Paginations userCount={this.state.table.actCnt} limit={this.state.limit}
                        offset={this.state.offset.act} pagnCallback={this.pagnCallback} type="act"
                    />
                    <h2 className="mt-5">Deactivated Keys</h2>
                    {this.state.table.deactivated}
                    <Paginations userCount={this.state.table.deactCnt} limit={this.state.limit}
                        offset={this.state.offset.deact} pagnCallback={this.pagnCallback} type="deact"
                    />
                </Container>
                {this.state.showEditModal &&
                    <TpUserEditForm show={this.state.showEditModal} handleClose={this.closeEditModal}
                        updateName={this.state.updateName} updateType={this.state.updateType}
                        updateTable={() => this.setTables()}
                    />
                }
                <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}
                    aria-labelledby="contained-modal-title-vcenter" scrollable="true"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.modal.head}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.modal.content.body}
                        {this.state.modal.content.buttons &&
                            <Row>
                                <Col sm={6}>
                                    <Button className="w-100" variant="secondary" onClick={this.closeDeleteModal}>
                                        Cancel
                                    </Button>
                                </Col>
                                <Col sm={6}>
                                    {(this.state.modal.content.submitLink === 'restoDltUser') &&
                                        <Button className="w-100" onClick={(e) => this.restoDltUser(e)}>
                                            Yes
                                        </Button>
                                    }
                                    {(this.state.modal.content.submitLink === 'filterUser') &&
                                        <Button disabled={disableSwitch} className="w-100" onClick={() => this.setTables()}>
                                            Filter
                                        </Button>
                                    }
                                </Col>
                            </Row>
                        }
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        userList: state.thirdPartyUser.data
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        deleteTpUser: (data) => {
            return dispatch(deleteTpUser(dispatch, data))
        },
        getTpUserCount: (options) => {
            return dispatch(getTpUserCount(dispatch, options))
        },
        getAllTpUsers: (options) => {
            return dispatch(getAllTpUsers(dispatch, options))
        },
        updateTpUser: (data) => {
            return dispatch(updateTpUser(dispatch, data))
        }
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(TpUser);
