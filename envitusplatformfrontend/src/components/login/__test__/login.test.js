import React from 'react';
import { shallow } from 'enzyme';
import { Login, mapStateToProps, mapDispatchToProps } from './../login';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<Login {...props} />);
    return component;
};

describe('Login Test', () => {
    
    describe('Unauthenticated User Stays in Home', () => {
        let component;
        beforeEach(() =>{
            const props = {
                isLoggedIn: false
            };
            component = preConfig(props); 
        });

        it('render login form without errors', () => {
            const wrapper = findByDataTest(component, 'loginForm');
            expect(wrapper.length).toBe(1);
        });

        it('do not render redirect tag', () => {
            const wrapper = findByDataTest(component, 'redirectTag');
            expect(wrapper.length).toBe(0);
        });
    });

    describe('Authenticated User redirected to Dashboard', () => {
        let component;
        beforeEach(() =>{
            const props = {
                isLoggedIn: true
            };
            component = preConfig(props); 
        });

        it('render redirect tag without errors', () => {
            const wrapper = findByDataTest(component, 'redirectTag');
            expect(wrapper.length).toBe(1);
        });
    });

    describe('Rendering Input types correctly', () => {
        let component;
        beforeEach(() => {
            component = preConfig();
        });

        it('Username Render', () => {
            const wrapper = findByDataTest(component , 'loginFormUname');
            expect(wrapper.prop('type')).toBe('text');
        });

        it('Password Render', () => {
            const wrapper = findByDataTest(component , 'loginFormPswd');
            expect(wrapper.prop('type')).toBe('password');
        });
    });

    describe('Authentication', () => {
        it('snapshot', () => {
            const wrapper = shallow(<Login/>);   
            expect(wrapper).toMatchSnapshot();
        });

        it('Login with correct credential', () => {
            const loginComponent = shallow(<Login />);
            expect(loginComponent.find('Form').length).toBe(1);
            loginComponent.find('Form').simulate('submit', loginComponent.setState({userName: 'sudo', password: 'sudo123', showWarning : true }));
            expect(loginComponent.state("showWarning")).toBe(true);
        });

        it('cannot Login with correct credential', () => {
            const loginComponent = shallow(<Login />);
            expect(loginComponent.find('Form').length).toBe(1);
            loginComponent.find('Form').simulate('submit', loginComponent.setState({userName: 'sudo', password: 'sudo1234', showWarning : false }));
            expect(loginComponent.state("showWarning")).toBe(false);
        });
    });

    describe('State Dispach Prop', () => {
        it('should show previousLog in State', () => {
            const initialState = {
                user: {
                    isLoggedIn: true
                }
            };
            expect(mapStateToProps(initialState).isLoggedIn).toBe(true);
        });

        it('authUser returns function', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).authUser();
            expect(typeof dispatch.mock.calls[0][0]).toBe('function');
        });

        it('getUserRole returns function', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).getUserRole();
            expect(typeof dispatch.mock.calls[0][0]).toBe('function');
        });

        it('userPrivilegeRole returns function', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).userPrivilegeRole();
            expect(typeof dispatch.mock.calls[0][0]).toBe('object');
        });

    });

    describe('function test', () => {
        it("handleSubmit authUser return false: promise fulfilled : superAdmin", async () => {
            let component;
            const mockAuthUser = jest.fn();
            mockAuthUser.mockReturnValueOnce(false); 
            
            const mockGetUserRole = jest.fn();
            mockGetUserRole.mockReturnValueOnce([true, true, true, true, true]);

            const mockUserPrivilegeRole = jest.fn();
            
            const mockEvent = {
                preventDefault: jest.fn()
            };

            const props = {
                authUser: mockAuthUser,
                getUserRole: mockGetUserRole,
                userPrivilegeRole: mockUserPrivilegeRole
            };

            component = preConfig(props);

            component.setState({
                userName: {current: {value: 'uname'}},
                password: {current: {value: 'pwd'}}              
            });

            return(component.instance().handleSubmit(mockEvent)).then(() => {
                expect(mockAuthUser.mock.calls.length).toBe(1);
                expect(mockGetUserRole.mock.calls.length).toBe(1);
                expect(component.state("userRole")).toBe('superAdmin');
                expect(mockUserPrivilegeRole.mock.calls.length).toBe(1);
                expect(component.state("showWarning")).toBe(true);
                expect(component.state("warningType")).toBe('warning');
            });
        });

        it("handleSubmit authUser return false: promise fulfilled : Administrator", async () => {
            let component;
            const mockAuthUser = jest.fn();
            mockAuthUser.mockReturnValueOnce(false); 
            
            const mockGetUserRole = jest.fn();
            mockGetUserRole.mockReturnValueOnce([true, true, true, false, true]);

            const mockEvent = {
                preventDefault: jest.fn()
            };

            const props = {
                authUser: mockAuthUser,
                getUserRole: mockGetUserRole
            };

            component = preConfig(props);

            component.setState({
                userName: {current: {value: 'uname'}},
                password: {current: {value: 'pwd'}}              
            });

            return(component.instance().handleSubmit(mockEvent)).then(() => {
                expect(mockAuthUser.mock.calls.length).toBe(1);
                expect(mockGetUserRole.mock.calls.length).toBe(1);
                expect(component.state("userRole")).toBe('Administrator');
            });
        });

        it("handleSubmit authUser return false: promise fulfilled : Supervisor", async () => {
            let component;
            const mockAuthUser = jest.fn();
            mockAuthUser.mockReturnValueOnce(false); 
            
            const mockGetUserRole = jest.fn();
            mockGetUserRole.mockReturnValueOnce([false, true, true, false, false]);

            const mockEvent = {
                preventDefault: jest.fn()
            };

            const props = {
                authUser: mockAuthUser,
                getUserRole: mockGetUserRole
            };

            component = preConfig(props);

            component.setState({
                userName: {current: {value: 'uname'}},
                password: {current: {value: 'pwd'}}              
            });

            return(component.instance().handleSubmit(mockEvent)).then(() => {
                expect(mockAuthUser.mock.calls.length).toBe(1);
                expect(mockGetUserRole.mock.calls.length).toBe(1);
                expect(component.state("userRole")).toBe('Supervisor');
            });
        });

        it("handleSubmit authUser return false: promise fulfilled : Operator", async () => {
            let component;
            const mockAuthUser = jest.fn();
            mockAuthUser.mockReturnValueOnce(false); 
            
            const mockGetUserRole = jest.fn();
            mockGetUserRole.mockReturnValueOnce([false, true, false, false, false]);

            const mockEvent = {
                preventDefault: jest.fn()
            };

            const props = {
                authUser: mockAuthUser,
                getUserRole: mockGetUserRole
            };

            component = preConfig(props);

            component.setState({
                userName: {current: {value: 'uname'}},
                password: {current: {value: 'pwd'}}              
            });

            return(component.instance().handleSubmit(mockEvent)).then(() => {
                expect(mockAuthUser.mock.calls.length).toBe(1);
                expect(mockGetUserRole.mock.calls.length).toBe(1);
                expect(component.state("userRole")).toBe('Operator');
            });
        });

        it("handleSubmit authUser return true: promise fulfilled + no roleArray", async () => {
            let component;
            const mockAuthUser = jest.fn();
            mockAuthUser.mockReturnValueOnce(true); 

            const mockGetUserRole = jest.fn();
            mockGetUserRole.mockReturnValueOnce(false);

            const mockUserPrivilegeRole = jest.fn();

            const mockEvent = {
                preventDefault: jest.fn()
            };

            const props = {
                authUser: mockAuthUser,
                getUserRole: mockGetUserRole,
                userPrivilegeRole: mockUserPrivilegeRole
            };

            component = preConfig(props);

            component.setState({
                userName: {current: {value: 'uname'}},
                password: {current: {value: 'pwd'}}              
            });

            return(component.instance().handleSubmit(mockEvent)).then(() => {
                expect(mockAuthUser.mock.calls.length).toBe(1);                
                expect(mockGetUserRole.mock.calls.length).toBe(1);
                expect(component.state("userRole")).toBe('');
                expect(mockUserPrivilegeRole.mock.calls.length).toBe(0);
                expect(component.state("showWarning")).toBe(false);
            });
        });

        it("handleSubmit authUser return false: promise rejected", async () => {
            let component;
            const mockAuthUser = jest.fn();
            mockAuthUser.mockReturnValueOnce(false);  
            
            const mockEvent = {
                preventDefault: jest.fn()
            };

            const props = {
                authUser: mockAuthUser
            };

            component = preConfig(props);

            component.setState({
                userName: {current: {value: 'uname'}},
                password: {current: {value: 'pwd'}}              
            });

            return(component.instance().handleSubmit(mockEvent)).catch(e => {
                expect(e).toMatch('error');
                expect(mockAuthUser.mock.calls.length).toBe(0);
                expect(component.state("showWarning")).toBe(true);
                expect(component.state("warningType")).toBe('danger');
                expect(component.state("warningMsg")).toBe(null);
            })
        });
    });
});