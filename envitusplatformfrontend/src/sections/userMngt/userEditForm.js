import React, { Component } from 'react';
import { Form, Button, Modal, Container } from 'react-bootstrap';
import { userFormData, userFrmValSts } from '../../constants';
import { connect } from 'react-redux';
import { updateUser, addUser } from '../../services/userApi';
import UserBasicForm from './userBasicForm';
import { intialaizeForm } from '../../action/formAction';
import { copyObjectValues } from '../../utils/index';
import {toastr} from 'react-redux-toastr';

export class UserEditForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            updateUserName: this.props.updateUserName,
        }
        this.props.intialaizeForm({ data: userFormData, 
            id: this.props.updateUserName, 
            deviceFrmValSts: {...userFrmValSts},
            updateType: this.props.updateType
        });
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async componentDidMount() {
        if(this.props.updateType === 'update') {
            const formData = copyObjectValues({ ...userFormData}, this.props.userData);
            this.props.intialaizeForm({ data: formData, 
                id: this.props.updateUserName, 
                deviceFrmValSts: {...userFrmValSts},
                updateType: this.props.updateType
            });
        } 
    }

    async handleSubmit(e) {
        e.preventDefault();
        try {
            let status;
            if(this.props.updateType === 'update') {
                status = await this.props.updateUser(this.props.formData.data);
            } else {
                const form = {...this.props.formData.data, ...{
                    activated: true,
                    creationLog: {
                        user: sessionStorage.getItem("whoami"),
                        date: new Date().toISOString()
                    }
                }}
                status = await this.props.addUser(form);
            }
            if (!status) {
                toastr.error('Oops !!', 'Some Error Occured');
            } else {
                toastr.success('Success !!', 'User Updated');
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
                        Add/Update User Details
                    </Modal.Title>
                </Modal.Header>    
                <Modal.Body>
                    <Container>
                        <Form id="myform" onSubmit={this.handleSubmit}>
                            <UserBasicForm />
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
        userData: (ownProps.updateUserName) ? state.user.data[ownProps.updateUserName] : {},
        formData: state.formData,
        userFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        updateUser: (data) => {
            return dispatch(updateUser(dispatch, data))
        },
        addUser: (data) => {
            return dispatch(addUser(dispatch, data))
        },
        intialaizeForm: (data) => {
            return dispatch(intialaizeForm(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(UserEditForm);
