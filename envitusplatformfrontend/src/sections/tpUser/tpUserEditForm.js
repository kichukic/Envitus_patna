import React, { Component } from 'react';
import { Form, Button, Modal, Container } from 'react-bootstrap';
import { tpUserFormData, tpUserFrmValSts } from '../../constants';
import { connect } from 'react-redux';
import { updateTpUser, addTpUser } from '../../services/tpUserApi';
import TpUserBasicForm from './tpUserBasicForm';
import { intialaizeForm } from '../../action/formAction';
import { copyObjectValues } from '../../utils/index';
import {toastr} from 'react-redux-toastr';

export class TpUserEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            updateName: this.props.updateName,
        }
        this.props.intialaizeForm({ data: tpUserFormData, 
            id: this.props.updateName, 
            deviceFrmValSts: {...tpUserFrmValSts},
            updateType: this.props.updateType
        });
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        if(this.props.updateType === 'update') {
            const formData = copyObjectValues({ ...tpUserFormData}, this.props.userData);
            this.props.intialaizeForm({ data: formData, 
                id: this.props.updateName, 
                deviceFrmValSts: {...tpUserFrmValSts},
                updateType: this.props.updateType
            });
        } 
    }

    async handleSubmit(e) {
        e.preventDefault();
        try {
            let status;
            if(this.props.updateType === 'update') {
                status = await this.props.updateTpUser(this.props.formData.data);
            } else {
                const form = {...this.props.formData.data, ...{
                    activated: true,
                    creationLog: {
                        user: sessionStorage.getItem("whoami"),
                        date: new Date().toISOString()
                    }
                }}
                status = await this.props.addTpUser(form);
            }
            if (!status) {
                toastr.error('Oops !!', 'Some Error Occured');
            } else {
                toastr.success('Success !!', 'Key Updated');
            }
        } catch(err) {
            toastr.error('Oops !!', 'Some Error Occured');
        }
        this.props.updateTable(); this.props.handleClose();
    }

    render() {
        let deactBtn = false;
        if(this.props.userFrmValSts) {
            deactBtn = Object.keys(this.props.userFrmValSts).some(k => {
                return this.props.userFrmValSts[k];
            })
        }

        return (
            <Modal aria-labelledby="contained-modal-title-vcenter" size="xl" scrollable="true"
                show={this.props.show} onHide={this.props.handleClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Add/Update Key Details
                    </Modal.Title>
                </Modal.Header>    
                <Modal.Body>
                    <Container>
                        <Form id="myform" onSubmit={this.handleSubmit}>
                            <TpUserBasicForm />
                        </Form>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={deactBtn} form="myform" variant="primary" type="submit">Save</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return ({
        userData: (ownProps.updateName) ? state.thirdPartyUser.data[ownProps.updateName] : {},
        formData: state.formData,
        userFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        updateTpUser: (data) => {
            return dispatch(updateTpUser(dispatch, data))
        },
        addTpUser: (data) => {
            return dispatch(addTpUser(dispatch, data))
        },
        intialaizeForm: (data) => {
            return dispatch(intialaizeForm(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(TpUserEditForm);
