import React from 'react';
import './header.scss';
import { Redirect, NavLink } from "react-router-dom";
import { connect } from 'react-redux';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav'
import { logOut } from '../../services/userApi';

export class Header extends React.Component {

    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }

    async handleLogout(event) {
        event.preventDefault();
        this.props.logout();
    }

    render() {

        if (!this.props.isLoggedIn) {
            return <Redirect data-test="redirectTag" to='/' />;
        }
        return (
            <Navbar data-test="navbarTag" collapseOnSelect className="shadow-sm" expand="md" bg="white" variant="light" sticky="top">
                <Navbar.Brand href="/dashboard">
                    <img src={process.env.PUBLIC_URL + process.env.REACT_APP_HEADER_LOGO}
                        alt="logo"
                        className="navbar-logo d-inline-block align-top"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ml-auto" >
                        <NavLink data-test="dash" className="m-auto" activeClassName="selected" to="/dashboard">Dashboard</NavLink>

                        {sessionStorage.getItem("userRole") !== 'Operator' ?
                            <NavLink data-test="devices" className="m-auto" activeClassName="selected" to="/devices">Devices</NavLink>
                            : null
                        }

                        <NavLink className="m-auto" activeClassName="selected" to="/livedata">LiveData</NavLink>

                        {(process.env.REACT_APP_DEVICE_FAMILY === "Postbox") ?
                            <NavLink className="m-auto" activeClassName="selected" to="/daliyReport">Daily Report</NavLink>
                            : null
                        }

                        {(sessionStorage.getItem("userRole") === 'superAdmin') ||
                            (sessionStorage.getItem("userRole") === 'Administrator') ?
                            <NavLink className="m-auto" activeClassName="selected" to="/users">Users</NavLink>
                            : null
                        }

                        {(sessionStorage.getItem("userRole") !== 'Operator') &&
                            (process.env.REACT_APP_DEVICE_FAMILY !== "Postbox") ?
                            <NavLink data-test="alarmRule" className="m-auto" activeClassName="selected" to="/alarmrule">
                                Alarm Rule
                            </NavLink>
                            : null
                        }

                        {(process.env.REACT_APP_DEVICE_FAMILY !== "Postbox") ?
                            <NavLink data-test="alarms" className="m-auto" activeClassName="selected" to="/activealarm">
                                Active Alarm
                            </NavLink>
                            : null
                        }

                        {((sessionStorage.getItem("userRole") === 'superAdmin') ||
                            (sessionStorage.getItem("userRole") === 'Administrator')) &&
                            (process.env.REACT_APP_DEVICE_FAMILY !== "Postbox") ?
                            <NavLink data-test="apikey" className="m-auto" activeClassName="selected" to="/apiKey">API Key</NavLink>
                            : null
                        }

                        {((sessionStorage.getItem("userRole") === 'superAdmin') ||
                            (sessionStorage.getItem("userRole") === 'Administrator')) &&
                            (process.env.REACT_APP_DEVICE_FAMILY !== "Postbox") ?
                            <NavLink data-test="diagnostics" className="m-auto" activeClassName="selected" to="/diagnostics">
                                Diagnostics
                            </NavLink>
                            : null
                        }

                        <button className="m-auto" onClick={this.handleLogout}>Logout</button>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export function mapStateToProps(state) {
    return ({
        isLoggedIn: state.user.isLoggedIn,
        userPrivilegeRole: state.user.userPrivilegeRole
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        logout: () => {
            return dispatch(logOut(dispatch))
        }
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
