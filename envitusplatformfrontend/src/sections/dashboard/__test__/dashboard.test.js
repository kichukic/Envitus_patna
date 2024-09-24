import React from 'react';
import { shallow } from 'enzyme';
import { Dashboard, mapStateToProps, mapDispatchToProps  } from './../dashboard';
import { findByDataTest } from '../../../utils';

const preConfig = (props={}) => {
    const component = shallow(<Dashboard {...props} />);
    return component;
};

describe('Dashboard Test', () => {
    describe('Redering ?' ,() => {
        it('renders DashB correctly', () => {
            let component;
            component = preConfig(); 
            const wrapper = findByDataTest(component, 'maindashTag');
            expect(wrapper.length).toBe(1);
        });
    })

    describe('Component Mount', () => {
        it("if selectedDevice", () => {
            let component;
            
            const props = {
                selectedDevice: true
            };
            component = preConfig(props);

            component.instance().updateDashboardChart = jest.fn();

            component.instance().componentDidMount()
            expect(component.instance().updateDashboardChart).toBeCalled();           
        });

        it("if !selectedDevice", () => {
            let component;
            
            const props = {
                selectedDevice: false
            };
            component = preConfig(props);

            component.instance().updateDashboardChart = jest.fn();

            component.instance().componentDidMount()
            expect(component.instance().updateDashboardChart).toHaveBeenCalledTimes(0);           
        });
    })

    describe('Component Update', () => {
        it("Props selectedDevice != PrevProps selectedDevice", () => {
            let component;
            
            const props = {
                selectedDevice: "Device1",
            };

            const mockPrevProps = {
                selectedDevice: "Device2"  
            }

            component = preConfig(props);
            component.instance().updateDashboardChart = jest.fn();

            component.instance().componentDidUpdate(mockPrevProps)
            expect(component.instance().updateDashboardChart).toHaveBeenCalledTimes(1);
            
        });

        it("Props selectedDevice == PrevProps selectedDevice", () => {
            let component;
            
            const props = {
                selectedDevice: "Device1",
            };

            const mockPrevProps = {
                selectedDevice: "Device1"  
            }

            component = preConfig(props);
            component.instance().updateDashboardChart = jest.fn();

            component.instance().componentDidUpdate(mockPrevProps)
            expect(component.instance().updateDashboardChart).toHaveBeenCalledTimes(0);
            
        });
    })

    describe('updateDashboardChart', () => {
        it("Case: DisplayEnabled, paramName - notTime, data pr. for not time in getDashData", async () => {
            let component;
            const mockGetDashboardData = jest.fn();
            const mockGetParamValueLimitIndex = jest.fn();

            mockGetDashboardData.mockReturnValueOnce([{data: {"notTime": "data1"}}]);
            mockGetParamValueLimitIndex.mockReturnValueOnce(0)

            const props = {
                selectedDeviceData: {
                    logicalDeviceId: 'Device1',
                    paramDefinitions: [{
                        isDisplayEnabled: true,
                        paramName: 'notTime',
                        maxRanges: {
                            max: 10,
                            min: 0
                        },
                        displayNameHtml: 'dNameHtml',
                        unitDisplayHtml: 2,
                        limits: [{color: 'Red'}]
                    }]
                },
                getDashboardData: mockGetDashboardData
            };

            component = preConfig(props);
            component.instance().getParamValueLimitIndex = mockGetParamValueLimitIndex;

            return(component.instance().updateDashboardChart()).then(() => {
                expect(mockGetDashboardData.mock.calls.length).toBe(1);
                expect(component.instance().getParamValueLimitIndex).toHaveBeenCalledTimes(1);
            });
        });

        it("Case: !DisplayEnabled", async () => {
            let component;
            const mockGetDashboardData = jest.fn();
            const mockGetParamValueLimitIndex = jest.fn();

            mockGetDashboardData.mockReturnValueOnce([{data: {"notTime": "data1"}}]);
            mockGetParamValueLimitIndex.mockReturnValueOnce(0)

            const props = {
                selectedDeviceData: {
                    logicalDeviceId: 'Device1',
                    paramDefinitions: [{
                        isDisplayEnabled: false,
                        paramName: 'notTime',
                        maxRanges: {
                            max: 10,
                            min: 0
                        },
                        displayNameHtml: 'dNameHtml',
                        unitDisplayHtml: 2,
                        limits: [{color: 'Red'}]
                    }]
                },
                getDashboardData: mockGetDashboardData
            };

            component = preConfig(props);
            component.instance().getParamValueLimitIndex = mockGetParamValueLimitIndex;

            return(component.instance().updateDashboardChart()).then(() => {
                expect(mockGetDashboardData.mock.calls.length).toBe(1);
                expect(component.instance().getParamValueLimitIndex).toHaveBeenCalledTimes(0);
            });
        });
    })

    describe('getParamValueLimitIndex', () => {
        it("case: limit, value = null", () => {
            let component;
            component = preConfig();

            expect(component.instance().getParamValueLimitIndex()).toBe(-1);
        });

        it("case: min < val < max", () => {
            let component;
            component = preConfig();

            expect(component.instance().getParamValueLimitIndex([{min: 1, max: 3}], 2)).toBe(0);
        });

        it("case: min < val, max = null", () => {
            let component;
            component = preConfig();

            expect(component.instance().getParamValueLimitIndex([{min: 1}], 2)).toBe(0);
        });

        it("case: max > val, min = null", () => {
            let component;
            component = preConfig();

            expect(component.instance().getParamValueLimitIndex([{max: 3}], 2)).toBe(0);
        });

        it("case: min, max = null", () => {
            let component;
            component = preConfig();

            expect(component.instance().getParamValueLimitIndex([{someName: "someVal"}], 2)).toBe(-1);
        });
    })

    describe('State Dispach Prop', () => {
        it('mapStateToProps works ?', () => {
            const initialState = {
                liveData: {
                    dashBoard: 'dashboard'
                },
                devices: {
                    selectedDevice: 'device1',
                    data: {"device1": "data1", "device2": "data2"}
                }
            };
            expect(mapStateToProps(initialState).selectedDevice).toBe('device1');
            expect(mapStateToProps(initialState).dashBoardData).toBe('dashboard');
            expect(mapStateToProps(initialState).selectedDeviceData).toBe('data1');
        });

        it('mapDispatchToProps works ?', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).getDashboardData();
            expect(typeof dispatch.mock.calls[0][0]).toBe('function');
        });
    });
});
