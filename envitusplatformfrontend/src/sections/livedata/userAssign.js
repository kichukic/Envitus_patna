import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAllUsers } from '../../services/userApi';
import { updateParam } from '../../services/liveDataApi';
import { Form,  Modal, Button } from 'react-bootstrap';
import AlertBox from '../../components/alertBox/alertBox';

export class UserAssign extends Component {
    constructor(props) {
        super(props);
        this.state = {
            operators: [],
            selectedUser: '',
            showWarning: false,
            warningType: '',
            warningMsg: ''
        }
        this.onUserChange = this.onUserChange.bind(this);
        this.assignUser = this.assignUser.bind(this);  
    }

    componentDidMount() {
        this.getUsers(); 
    }

    getUsers = async() => {
        const users = await this.props.getAllUsers({type: "Operator"});
        this.setState({operators: users})
    }

    onUserChange(e) {
        this.setState({selectedUser: e.target.value})
    }

    async assignUser(e) {
        e.preventDefault();
        if(this.state.selectedUser === '') {
            this.setState({
                showWarning: true,
                warningType: 'warning',
                warningMsg: 'Please select Operator'
            });
            return;
        }
        try {
            const status = await this.props.updateParam({deviceId: this.props.deviceId,
                params: ["assigned_to"],
                values: [this.state.selectedUser]
            });
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
                    warningMsg: 'User Assigned successfully'
                });
            }
        } catch(err) {
            this.setState({
                showWarning: true,
                warningType: 'danger',
                warningMsg: 'Some error Occured'
            });
        }    
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Operators</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId="role">
                        <Form.Label>Operator</Form.Label>
                        <select value={this.state.selectedUser} onChange={this.onUserChange}
                            name="role" className="form-control" required
                        >
                            <option hidden value="">None</option>
                            {this.state.operators.map((operator) => <option key={operator.userName} value={operator.userName}>
                                {operator.userName}
                            </option>)}
                        </select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <AlertBox show={this.state.showWarning}
                        variant={this.state.warningType}
                        text={this.state.warningMsg}
                    />
                    <Button variant="secondary" onClick={this.props.handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.assignUser}>
                        Assign
                    </Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

function mapStateToProps(state) {
    return ({
        
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        getAllUsers: (options) => {
            return dispatch(getAllUsers(dispatch, options))
        },
        updateParam: (data) => {
            return dispatch(updateParam(dispatch, data))
        }   
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAssign);
