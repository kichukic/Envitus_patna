import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Modal, Button, Row, Col, Form } from 'react-bootstrap';
import DeviceEditForm from '../../sections/deviceMngt/deviceEditForm';
import { MdAddCircleOutline, MdDelete, MdRemoveCircleOutline } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { deleteDevice, getDeviceCount, getAllDevices, updateDeviceData } from '../../services/deviceApi';
import LiveDataTable from '../liveDataTable/liveDataTable';
import { updateSelectedDevice } from '../../action/deviceAction';
import DarkOverlays from '../overlays/darkOverlays';
import Paginations from '../paginations/paginations';
import Overlays from '../overlays/overlays';
import { toastr } from 'react-redux-toastr';
import Loader from 'react-loader-spinner';
import './deviceTable.scss';

export class DeviceTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            offset: { act: 0, deact: 0 },
            limit: 10,
            table: { activated: '', deactivated: '', actCnt: 0, deactCnt: 0 },
            showEditModal: false,
            updateType: '',
            updateDeviceId: '',
            showDeleteModal: false,
            deleteDeviceId: '',
            modal: { head: '', content: { body: '', buttons: '', submitLink: '' } },
            apiCall: { restore: '', permanent: '' },
            deactivationReason: '',
            filter: { type: ['deviceId', 'zone', 'city', 'subType'], option: {} },
            filterCurrent: { text: '', select: '' },
            allowSelecting: true,
        }
        this.showAddModal = this.showAddModal.bind(this);
        this.showFilterModal = this.showFilterModal.bind(this);
        this.showUpdateModal = this.showUpdateModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.showTempDeleteModal = this.showTempDeleteModal.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.showRestoreModal = this.showRestoreModal.bind(this);
        this.viewDevDetails = this.viewDevDetails.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.filterChange = this.filterChange.bind(this);
        this.addFilter = this.addFilter.bind(this);
        this.removeFilter = this.removeFilter.bind(this);
        this.pagnCallback = this.pagnCallback.bind(this);
        this.selectDev = this.selectDev.bind(this);
    }

    async componentDidMount() {
        this.setTables();
    }

    showAddModal() {
        this.setState({
            showEditModal: true,
            updateType: 'add',
            updateDeviceId: '',
        });
    }

    showFilterModal() {
        const filterTable = { head: ['Filter', 'Condition', 'Remove'], body: [] };
        for (const key of Object.keys(this.state.filter.option)) {
            const row = [key, this.state.filter.option[key],
                <MdDelete onClick={() => this.removeFilter(key)} className="oprnButton" />]
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
                    <h3><MdAddCircleOutline onClick={this.addFilter} className="oprnButton" /></h3>
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
                            <MdRemoveCircleOutline className="ml-2 oprnButton"
                                onClick={() => { this.setState({ allowSelecting: true }); this.setTables() }}
                            />
                        </DarkOverlays>
                    </h3>
                </summary>
            </div>
        this.setState({
            showDeleteModal: true,
            modal: {
                head: modalHead, content: {
                    body: filter, buttons: true,
                    submitLink: 'filterDevice'
                }
            },
            apiCall: { restore: '', permanent: '' }
        });
    }

    addFilter() {
        if (this.state.filterCurrent.select && this.state.filterCurrent.text) {
            const filter = { ...this.state.filter };
            const types = filter.type.filter(type => type !== this.state.filterCurrent.select);
            const option = { ...filter.option, ...{ [this.state.filterCurrent.select]: this.state.filterCurrent.text } }
            this.setState({ filter: { type: types, option: option }, filterCurrent: { select: '', text: '' } },
                () => this.showFilterModal());
        } else {
            toastr.error('Oops !!', 'Select Both Filter and Keyword');
        }
    }

    removeFilter(select) {
        const filter = { ...this.state.filter };
        const types = filter.type; types.push(select);
        const option = filter.option; delete option[select];
        this.setState({ filter: { type: types, option: option }, filterCurrent: { select: '', text: '' } },
            () => this.showFilterModal());
    }

    filterChange(e) {
        if (e.target.name === 'select') {
            const text = this.state.filterCurrent.text;
            this.setState({ filterCurrent: { select: e.target.value, text: text } }, () => this.showFilterModal());
        } else {
            const select = this.state.filterCurrent.select;
            this.setState({ filterCurrent: { text: e.target.value, select: select } }, () => this.showFilterModal());
        }
    }

    showUpdateModal(id) {
        this.setState({
            showEditModal: true,
            updateType: 'update',
            updateDeviceId: id,
        });
    }

    closeEditModal() {
        this.setState({ showEditModal: false });
    }

    showTempDeleteModal(id) {
        const input =
            <Form.Control type="text" onChange={this.handleChange} className="w-100 mb-3" placeholder="Reason For Deactivation" />
        this.setState({
            showDeleteModal: true,
            deleteDeviceId: id,
            modal: {
                head: 'Continue Deactivating the Device ?', content: {
                    body: input, buttons: true,
                    submitLink: 'restoDltDevice'
                }
            },
            apiCall: { restore: false, permanent: false }
        });
    }

    showDeleteModal(id) {
        this.setState({
            showDeleteModal: true,
            deleteDeviceId: id,
            modal: {
                head: 'Continue Deleting the Device ?', content: {
                    body: '', buttons: true,
                    submitLink: 'restoDltDevice'
                }
            },
            apiCall: { restore: false, permanent: true }
        });
    }

    showRestoreModal(id) {
        this.setState({
            showDeleteModal: true,
            deleteDeviceId: id,
            modal: {
                head: 'Continue Restoring the Device ?', content: {
                    body: '', buttons: true,
                    submitLink: 'restoDltDevice'
                }
            },
            apiCall: { restore: true, permanent: '' }
        });
    }

    viewDevDetails(id) {
        const devDet = <div><pre>{JSON.stringify(this.props.deviceList[id], null, 4)}</pre></div>
        this.setState({
            showDeleteModal: true,
            modal: {
                head: 'Device: ' + id, content: {
                    body: devDet, buttons: false,
                    submitLink: ''
                }
            },
            apiCall: { restore: '', permanent: '' }
        });
    }

    closeDeleteModal() {
        this.setState({
            showDeleteModal: false, filter: { type: ['deviceId', 'zone', 'city', 'subType'], option: {} },
            filterCurrent: { text: '', select: '' }
        });
    }

    async setTables() {
        const loader = <div className="text-center">
            <Loader type="MutatingDots" color="#00BFFF" height={100} width={100} />
            <br /><strong className="lead">Loading !!</strong></div>
        this.setState({ table: { activated: loader, deactivated: loader, actCnt: 0, deactCnt: 0 } });

        let extraOption = {};
        const filter = { ...this.state.filter.option }; const array = ['deviceId', 'zone', 'city', 'subType'];
        array.forEach(filt => {
            if (filter.hasOwnProperty(String(filt))) {
                extraOption = { ...extraOption, ...{ [filt]: this.state.filter.option[filt] } }
            } else {
                extraOption = { ...extraOption, ...{ [filt]: 'null' } }
            }
        })

        const devCountAct = await this.props.getDeviceCount({ ...extraOption, ...{ activated: true } });
        const devCountDeact = await this.props.getDeviceCount({ ...extraOption, ...{ activated: false } });
        let showOprn = true; const alignLeft = true; let activated; let deactivated;
        const notFound = <div className="text-center">
            <img src={process.env.PUBLIC_URL + "/img/notFound.png"} alt="No Data"/>
            <br/><strong className="lead">No Data !!</strong></div>
        
        if(devCountAct > 0) {
            const tableHeadAct = ['City', 'Device', 'Live', 'Landmark', 'Operation'];
            if(this.props.hideOprn) {tableHeadAct.pop(); showOprn = false}
            const devicesAct = await this.props.getAllDevices({...extraOption,
                ...{limit: this.state.limit, offset: this.state.offset.act, activated: true}});
            const tableBodyAct = devicesAct.map(device => {
                if (this.props.enableSltDev && this.state.allowSelecting) {
                    this.props.updateSelectedDevice(device.deviceId);
                    this.setState({ allowSelecting: false })
                }
                const isLive = (device.lastDataReceiveTime) ? (((new Date().valueOf() - device.lastDataReceiveTime) 
                    < (15 * 60 * 1000)) ? 'status-dot live' : 'status-dot not-live') : 'status-dot not-live';
                
                const realTimeStatus = (device.lastDataReceiveTime === "") ? "No Sufficient Data" :
                    new Date(device.lastDataReceiveTime).toLocaleString();
                const nearTimeStatus = (device.nearTimeStatus === "") ? "No Sufficient Data" :
                    new Date(device.nearTimeStatus).toLocaleString();

                const hovertext = {head: 'Status', body : 
                    <div>
                        <p className="font-weight-lighter">Realtime Status: {realTimeStatus}</p>
                        <p className="font-weight-lighter">Neartime Status: {nearTimeStatus}</p>
                    </div>
                }

                const live = 
                    <Overlays hovertext={hovertext}>
                        <span className={isLive} />
                    </Overlays>
                
                return([device.location.city, device.deviceId, live, device.location.landMark]);
            })
            activated =
                <LiveDataTable tableBody={tableBodyAct} tableHead={tableHeadAct} showOprn={showOprn}
                    onEdit={this.showUpdateModal} onDelete={this.showTempDeleteModal} alignLeft={alignLeft}
                    onView={this.viewDevDetails} enableSltDev={this.props.enableSltDev} selectDev={this.selectDev}
                />;
        } else {
            activated = notFound;
        }

        if (devCountDeact > 0 && !this.props.hideDeact) {
            const tableHeadDeact = ['City', 'Device', 'Landmark', 'Deact User', 'Deact Time', 'Reason', 'Operation'];
            const devicesDeact = await this.props.getAllDevices({
                ...extraOption,
                ...{ limit: this.state.limit, offset: this.state.offset.deact, activated: false }
            });
            const tableBodyDeact = devicesDeact.map(device => {
                const date = new Date(device.deactLog.date).toLocaleString("en-US");
                return ([device.location.city, device.deviceId, device.location.landMark, device.deactLog.user,
                    date, device.deactLog.reason]);
            })
            const restore = true;
            deactivated =
                <LiveDataTable tableBody={tableBodyDeact} tableHead={tableHeadDeact} showOprn={showOprn}
                    onEdit={this.showUpdateModal} onDelete={this.showDeleteModal} alignLeft={alignLeft}
                    onView={this.viewDevDetails} onRestore={this.showRestoreModal} restore={restore}
                />;
        } else {
            deactivated = notFound;
        }

        this.setState({ table: { activated: activated, deactivated: deactivated, actCnt: devCountAct, deactCnt: devCountDeact } },
            () => this.closeDeleteModal())
    }

    async restoDltDevice(e) {
        e.preventDefault();
        try {
            let status;
            if (this.state.apiCall.restore) {
                const devDetails = {
                    ...this.props.deviceList[this.state.deleteDeviceId], ...{
                        activated: true,
                        deactLog: ""
                    }
                };
                status = await this.props.updateDeviceDetails(devDetails);
            } else {
                if (this.state.apiCall.permanent) {
                    status = await this.props.deleteDevice({ deviceId: this.state.deleteDeviceId });
                } else {
                    const devDetails = {
                        ...this.props.deviceList[this.state.deleteDeviceId], ...{
                            activated: false,
                            deactLog: {
                                user: sessionStorage.getItem("whoami"),
                                date: new Date().toISOString(),
                                reason: this.state.deactivationReason
                            }
                        }
                    };
                    status = await this.props.updateDeviceDetails(devDetails)
                }
            }
            if (!status) {
                toastr.error('Oops !!', 'Some Error Occured');
            } else {
                const info = (this.state.apiCall.restore) ? 'Device Restored' :
                    (this.state.apiCall.permanent) ? 'Device Deleted' : 'Device Deactivated';
                toastr.success('Success !!', info);
            }
        } catch (err) {
            toastr.error('Oops !!', 'Some Error Occured');
        }
        this.setTables(); this.closeDeleteModal();
    }

    selectDev(id) {
        this.props.updateSelectedDevice(id);
    }

    handleChange(event) {
        this.setState({ deactivationReason: event.target.value })
    }

    pagnCallback(type, newOffset) {
        const sibling = (type === 'act') ? 'deact' : 'act'
        this.setState({ offset: { [type]: newOffset, [sibling]: this.state.offset[sibling] } },
            () => this.setTables())
    }

    render() {
        const disableSwitch = (this.state.filter.option && (Object.keys(this.state.filter.option).length > 0)) ? false : true;
        return (
            <div className="pt-3">
                <Container>
                    <div className="d-flex justify-content-between">
                        <h2>Devices</h2>
                        <div>
                            <h2 className="d-flex justify-content-start">
                                <DarkOverlays hovertext="Filter" placement="bottom">
                                    <summary>
                                        <FiFilter className="oprnButton" onClick={this.showFilterModal} />
                                    </summary>
                                </DarkOverlays>
                                {(!this.props.hideDeact) &&
                                    <DarkOverlays hovertext="Add" placement="bottom">
                                        <summary>
                                            <MdAddCircleOutline className="oprnButton" onClick={this.showAddModal} />
                                        </summary>
                                    </DarkOverlays>
                                }
                            </h2>
                        </div>
                    </div>
                    {this.state.table.activated}
                    <Paginations userCount={this.state.table.actCnt} limit={this.state.limit}
                        offset={this.state.offset.act} pagnCallback={this.pagnCallback} type="act"
                    />
                    {(!this.props.hideDeact) &&
                        <div>
                            <h2 className="mt-5">Deactivated Devices</h2>
                            {this.state.table.deactivated}
                            <Paginations userCount={this.state.table.deactCnt} limit={this.state.limit}
                                offset={this.state.offset.deact} pagnCallback={this.pagnCallback} type="deact"
                            />
                        </div>
                    }
                </Container>
                {this.state.showEditModal &&
                    <DeviceEditForm show={this.state.showEditModal} handleClose={this.closeEditModal}
                        updateDeviceId={this.state.updateDeviceId} updateType={this.state.updateType}
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
                                    {(this.state.modal.content.submitLink === 'restoDltDevice') &&
                                        <Button className="w-100" onClick={(e) => this.restoDltDevice(e)}>
                                            Yes
                                        </Button>
                                    }
                                    {(this.state.modal.content.submitLink === 'filterDevice') &&
                                        <Button disabled={disableSwitch} className="w-100" 
                                            onClick={() => {this.setState({allowSelecting: true}); this.setTables()}}
                                        >
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
        deviceList: state.devices.data
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        deleteDevice: (data) => {
            return dispatch(deleteDevice(dispatch, data))
        },
        getDeviceCount: (options) => {
            return dispatch(getDeviceCount(dispatch, options))
        },
        getAllDevices: (options) => {
            return dispatch(getAllDevices(dispatch, options))
        },
        updateDeviceDetails: (data) => {
            return dispatch(updateDeviceData(dispatch, data))
        },
        updateSelectedDevice: (id) => {
            return dispatch(updateSelectedDevice(id))
        }
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceTable);
