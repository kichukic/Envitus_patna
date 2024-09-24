import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { authUser, getUserRole, regUser, authOneLoginUser } from '../../services/userApi';
import { Redirect } from "react-router-dom";
import { connect } from 'react-redux';

import { superAdmin, admin, supervisor, userFormData, userFrmValSts } from '../../constants';
import { userPrivilegeRole } from '../../action/userAction';
import { intialaizeForm } from '../../action/formAction';

import { toastr } from 'react-redux-toastr';
import RegisterForm from './registerForm.js';
import './login.scss';

export class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userName: React.createRef(),
            password: React.createRef(),
            userRole: '',
            showModal: true,
        };

        this.props.intialaizeForm({
            data: userFormData,
            id: '',
            deviceFrmValSts: { ...userFrmValSts },
            updateType: 'add'
        });

        this.showModal = this.showModal.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.register = this.register.bind(this);
        this.oneLogin = this.oneLogin.bind(this);
    }

    async handleSubmit(event) {
        event.preventDefault();
        const logginDetails = {
            userName: this.state.userName.current.value,
            password: this.state.password.current.value
        }
        try {
            const status = await this.props.authUser(logginDetails);
            console.log("status  > > > >> + + ++ + +", status);
            const uname = logginDetails.userName;
            const roleArray = await this.props.getUserRole(uname);

            if (roleArray) {
                if (JSON.stringify(roleArray) === JSON.stringify(superAdmin)) {
                    this.state.userRole = 'superAdmin';
                }
                else if (JSON.stringify(roleArray) === JSON.stringify(admin)) {
                    this.state.userRole = 'Administrator';
                }
                else if (JSON.stringify(roleArray) === JSON.stringify(supervisor)) {
                    this.state.userRole = 'Supervisor';
                }
                else {
                    this.state.userRole = 'Operator';
                }
            }
            if (this.state.userRole !== '') {
                sessionStorage.setItem("userRole", this.state.userRole);
                this.props.userPrivilegeRole(this.state.userRole);
            }

            if (!status) {
                toastr.error('invalid username or password');
            }
        } catch (err) {
            toastr.error('Oops !!', 'Some error Occured');
        }
    }

    async oneLogin() {
        const status = await this.props.authOneLoginUser();
        if (status) {
            sessionStorage.setItem("userRole", 'Operator');
            this.props.userPrivilegeRole('Operator');
        } else {
            toastr.error('Oops !!', 'Invalid Username or Password');
        }
    }

    showModal(show) {
        this.setState({ showModal: show });
    }

    handleClose() {
        this.props.intialaizeForm({
            data: userFormData,
            id: '',
            deviceFrmValSts: { ...userFrmValSts },
            updateType: 'add'
        });
        this.setState({ showModal: false });
    }

    async register(e) {
        e.preventDefault();
        try {
            const form = {
                ...this.props.formData.data, ...{
                    activated: true,
                    creationLog: {
                        user: this.props.formData.data.userName,
                        date: new Date().toISOString()
                    },
                    devices: [],
                    role: "Operator"
                }
            };
            const status = await this.props.regUser(form);
            if (!status) {
                toastr.error('Oops !!', 'Some Error Occured');
            } else {
                this.setState({ showModal: true });
                toastr.success('Success !!', 'User Registered. Now Login');
            }
        } catch (err) {
            toastr.error('Oops !!', 'Some Error Occured');
        }
        this.handleClose();
    }

    render() {
        if (this.props.isLoggedIn) {
            return <Redirect data-test="redirectTag" to='/dashboard' />;
        }

        let deactBtn = false;
        if (this.props.userFrmValSts) {
            deactBtn = Object.keys(this.props.userFrmValSts).some(k => {
                return this.props.userFrmValSts[k];
            })
        }

        return (
            <div>
                { this.state.showModal &&
                    <Form data-test="loginForm" onSubmit={this.handleSubmit}>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control data-test="loginFormUname" type="text" ref={this.state.userName}
                                placeholder="Username" required
                            />
                        </Form.Group>
                        <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control data-test="loginFormPswd" type="password" ref={this.state.password}
                                placeholder="Password" required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Login</Button>
                        {(!process.env.REACT_APP_SSO === 'true') &&
                            <Button variant="primary" className="w-100 mt-2" onClick={this.oneLogin}>Login Using OneLogin</Button>
                        }
                        <div className="mt-5">
                            <small>Not a User ?</small>
                            <summary>
                                <strong className="ml-2 hover-item" onClick={() => this.showModal(false)}>Register</strong>
                            </summary>
                        </div>
                    </Form>
                }
                { !this.state.showModal &&
                    <Form id="myform" onSubmit={this.register}>
                        <RegisterForm />
                        <Button disabled={deactBtn} className="w-100" form="myform" variant="primary" type="submit">Register</Button>
                        <div className="mt-5">
                            <small>Already Registered?</small>
                            <summary>
                                <strong className="ml-2 hover-item" onClick={() => this.showModal(true)}>Login</strong>
                            </summary>
                        </div>
                    </Form>
                }

            </div>
        );
    }
}


export function mapStateToProps(state) {
    return ({
        isLoggedIn: state.user.isLoggedIn,
        formData: state.formData,
        userFrmValSts: state.formData.deviceFrmValSts
    });
}

export function mapDispatchToProps(dispatch) {
    return {
        authUser: (logginDetails) => {
            return dispatch(authUser(dispatch, logginDetails))
        },
        getUserRole: (uname) => {
            return dispatch(getUserRole(dispatch, uname))
        },
        userPrivilegeRole: (role) => {
            return dispatch(userPrivilegeRole(role))
        },
        regUser: (data) => {
            return dispatch(regUser(dispatch, data))
        },
        intialaizeForm: (data) => {
            return dispatch(intialaizeForm(data))
        },
        authOneLoginUser: () => {
            return dispatch(authOneLoginUser(dispatch))
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
