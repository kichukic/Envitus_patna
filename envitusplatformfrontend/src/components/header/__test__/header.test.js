import React from 'react';
import { shallow } from 'enzyme';
import { Header, mapStateToProps, mapDispatchToProps } from './../header';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<Header {...props} />);
    return component;
};

describe('Header Test', () => {
    
    describe('Unauthenticated User Stays in Home', () => {
        let component;

        it('non authenticated users redired to Home', () => {
            const props = {
                isLoggedIn: false
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'redirectTag');
            expect(wrapper.length).toBe(1);
        });

        it('Nanvbar renders for authenticated user', () => {
            const props = {
                isLoggedIn: true
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'navbarTag');
            expect(wrapper.length).toBe(1);
        });
    });

    describe('User Privileges', () => {
        let component;
        it('should navigate all authorized users to dashboard', () => {
            const props = {
                isLoggedIn: true
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'dash');
            expect(wrapper.length).toBe(1);
        });

        it('should not navigate any authorized operator user to devices', () => {
            const props = {
                isLoggedIn: true,
                userPrivilegeRole: !'Operator'
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'devices');
            expect(wrapper.length).toBe(1);
        });

        it('should not navigate any authorized operator user to devices #2', () => {
            const props = {
                isLoggedIn: true,
                userPrivilegeRole: 'Operator'
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'devices');
            expect(wrapper.length).toBe(0);
        });

        it('should navigate all authorized users to native dashboard', () => {
            const props = {
                isLoggedIn: true
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'nativeDash');
            expect(wrapper.length).toBe(1);
        });

        it('should navigate all authorized super admin and admin users to users', () => {
            const props = {
                isLoggedIn: true,
                userPrivilegeRole: 'superAdmin' || 'admin'
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'users');
            expect(wrapper.length).toBe(1);
        });

        it('it should navigate all authorized super admin and admin users to alarm rule', () => {
            const props = {
                isLoggedIn: true,
                userPrivilegeRole: 'superAdmin' || 'admin'
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'alarmRule');
            expect(wrapper.length).toBe(1);
        });

        it('it should navigate all users to alarms', () => {
            const props = {
                isLoggedIn: true,
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'alarms');
            expect(wrapper.length).toBe(1);
        });

        it('it should navigate only authorized super admin users to API key', () => {
            const props = {
                isLoggedIn: true,
                userPrivilegeRole: 'superAdmin'
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'apikey');
            expect(wrapper.length).toBe(1);
        });

        it('it should navigate only authorized super admin users to diagnostics', () => {
            const props = {
                isLoggedIn: true,
                userPrivilegeRole: 'superAdmin'
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'diagnostics');
            expect(wrapper.length).toBe(1);
        });
    });
    
    


    describe('State Dispach Prop', () => {
        it('should show previous log in value', () => {
            const initialState = {
                user: {
                    isLoggedIn: true
                }
            };
            expect(mapStateToProps(initialState).isLoggedIn).toBe(true);
        });

        it('logout returns function', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).logout();
            expect(typeof dispatch.mock.calls[0][0]).toBe('function');
        });
    }); 

    describe('function test', () => {
        it("handleLogout function test", () => {
            let component;
            const mockCall = jest.fn();
            
            const props = {
                logout: mockCall
            };

            const mockEvent = {
                preventDefault: jest.fn()
            };

            component = preConfig(props);

            component.instance().handleLogout(mockEvent);
            expect(mockCall.mock.calls.length).toBe(1);
        });
    });

});