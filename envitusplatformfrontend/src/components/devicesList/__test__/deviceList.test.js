import React from 'react';
import { shallow } from 'enzyme';   
import { DeviceList, mapStateToProps, mapDispatchToProps } from './../devicesList';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<DeviceList {...props} />);
    return component;
};

describe('DeviceList Test', () => {
    describe('Snap Test', () => {
        it('match snapshot', () => {
            const wrapper = shallow(<DeviceList/>);   
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('State Dispach Prop', () => {
        it('should show previous device count value', () => {
            const initialState = {
                devices: {
                    deviceCount: 1
                }
            };
            expect(mapStateToProps(initialState).deviceCount).toBe(1);
        });

        it('should update selected device', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).updateSelectedDevice();
            expect(dispatch.mock.calls[0][0]).toEqual({ type: 'UPDATE_SELECTED_DEVICE'});
        });

        it('getDeviceCount returns function', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).getDeviceCount();
            expect(typeof dispatch.mock.calls[0][0]).toBe('function');
        });

        it('getDeviceDetails returns function', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).getDeviceDetails();
            expect(typeof dispatch.mock.calls[0][0]).toBe('function');
        });
    });

    describe('function test', () => {
        describe('Component Mount', () => {
            it("component mount : listType - sensor: function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "sensor"
                };
                
                component = preConfig(props);
                component.instance().formatSensorList = jest.fn();
    
                return(component.instance().componentDidMount()).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(1);
                    expect(component.instance().formatSensorList).toBeCalled();
                });            
            });
    
            it("component mount : listType - table: function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "table"
                };
    
                component = preConfig(props);
                component.instance().formatTableList = jest.fn();
    
                return(component.instance().componentDidMount()).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(1);
                    expect(component.instance().formatTableList).toBeCalled();
                });
            });

            it("component mount : listType - sensor3D: function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "sensor3D"
                };
    
                component = preConfig(props);
                component.instance().formatSensor3DList = jest.fn();
    
                return(component.instance().componentDidMount()).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(1);
                    expect(component.instance().formatSensor3DList).toBeCalled();
                });
            });
        })

        describe('Component Update', () => {
            it("component update : listType - sensor : propUpdateList != prevPropsUpdateList : function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "sensor",
                    updateList: "List1"
                };
    
                const mockPrevProps = {
                    updateList: "List2"  
                }
    
                component = preConfig(props);
                component.instance().formatSensorList = jest.fn();
    
                return(component.instance().componentDidUpdate(mockPrevProps)).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(1);
                    expect(component.instance().formatSensorList).toBeCalled();
                });
            });
    
            it("component update : listType - table : propUpdateList != prevPropsUpdateList : function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "table",
                    updateList: "List1"
                };
    
                const mockPrevProps = {
                    updateList: "List2"  
                }
    
                component = preConfig(props);
                component.instance().formatTableList = jest.fn();
    
                return(component.instance().componentDidUpdate(mockPrevProps)).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(1);
                    expect(component.instance().formatTableList).toBeCalled();
                });
            });
            
            it("component update : listType - sensor3D : propUpdateList != prevPropsUpdateList : function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "sensor3D",
                    updateList: "List1"
                };
    
                const mockPrevProps = {
                    updateList: "List2"  
                }
    
                component = preConfig(props);
                component.instance().formatSensor3DList = jest.fn();
    
                return(component.instance().componentDidUpdate(mockPrevProps)).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(1);
                    expect(component.instance().formatSensor3DList).toBeCalled();
                });
            });
    
            it("component update : listType - any : propUpdateList = prevPropsUpdateList : function calling ?", async() => {
                let component;
                const mockgetDeviceCount = jest.fn();
                
                const props = {
                    getDeviceCount: mockgetDeviceCount,
                    listType: "sensor",
                    updateList: "List1"
                };
    
                const mockPrevProps = {
                    updateList: "List1"  
                }
    
                component = preConfig(props);
                component.instance().formatSensorList = jest.fn();
    
                return(component.instance().componentDidUpdate(mockPrevProps)).then(() => {
                    expect(mockgetDeviceCount.mock.calls.length).toBe(0);
                    expect(component.instance().formatSensorList).toHaveBeenCalledTimes(0);
                });
            });
        })
        
        describe('formatSensorList', () => {
            it("formatSensorList : function calling ?", async () => {
                let component;
                const mockGetDevDetails = jest.fn();
                const mockUpdateSelectedDevice = jest.fn();
    
                mockGetDevDetails.mockReturnValueOnce({deviceId:'id1', type:'type1', devFamily:'family1', 
                subType: 'sub1', location: {latitude: 1, longitude: 2, slot: 'slot1', dataPosition: 'pos1', 
                dataNormal: 'nor1'}}).mockReturnValueOnce({deviceId:'id2',type:'type2', devFamily:'family2',
                subType: 'sub2', location: {latitude: 1, longitude: 2, slot: 'slot2', dataPosition: 'pos2', 
                dataNormal: 'nor2'}});      
    
                const props = {
                    getDeviceDetails: mockGetDevDetails,
                    updateSelectedDevice: mockUpdateSelectedDevice
                };
    
                component = preConfig(props);
    
                return(component.instance().formatSensorList(2)).then(() => {
                    expect(mockGetDevDetails.mock.calls.length).toBe(2);
                    const wrapperSensor = component.state("deviceList");
                    expect(wrapperSensor.props.children[0].props['data-test']).toBe('deviceListSensor');
                    expect(mockUpdateSelectedDevice.mock.calls.length).toBe(1);
                });
            });
        })

        describe('formatSensor3DList', () => {
            it("formatSensorList : function calling ?", async () => {
                let component;
                const mockGetDevDetails = jest.fn();
                const mockUpdateSelectedDevice = jest.fn();
    
                mockGetDevDetails.mockReturnValueOnce({deviceId:'id1', type:'type1', devFamily:'family1', 
                subType: 'sub1', location: {latitude: 1, longitude: 2, slot: 'slot1', dataPosition: 'pos1', 
                dataNormal: 'nor1'}}).mockReturnValueOnce({deviceId:'id2',type:'type2', devFamily:'family2',
                subType: 'sub2', location: {latitude: 1, longitude: 2, slot: 'slot2', dataPosition: 'pos2', 
                dataNormal: 'nor2'}});        
    
                const props = {
                    getDeviceDetails: mockGetDevDetails,
                    updateSelectedDevice: mockUpdateSelectedDevice
                };
    
                component = preConfig(props);
    
                return(component.instance().formatSensor3DList(2)).then(() => {
                    expect(mockGetDevDetails.mock.calls.length).toBe(2);
                    const wrapperSensor = component.state("deviceList");
                    expect(wrapperSensor[0][0].props['data-test']).toBe('deviceListSensor3D');
                    expect(mockUpdateSelectedDevice.mock.calls.length).toBe(1);
                });
            });
        })
        
        describe('formatTableList', () => {
            it("formatTableList showOperation -> true: function calling ?", async () => {
                let component;
                const mockGetDevDetails = jest.fn();
                const mockUpdateDevice = jest.fn();
                const mockDeleteDevice = jest.fn();
                const mockUpdateSelectedDevice = jest.fn();
    
                mockGetDevDetails.mockReturnValueOnce(
                    {deviceId:'id', type:'type', devFamily:'family', subType: 'sub'}
                );      
    
                const props = {
                    showDeviceOprn: true,
                    getDeviceDetails: mockGetDevDetails,
                    updateDevice: mockUpdateDevice,
                    deleteDevice: mockDeleteDevice,
                    updateSelectedDevice: mockUpdateSelectedDevice
                };
    
                component = preConfig(props);
                component.instance().formatTableList(1);
                
                expect(mockGetDevDetails.mock.calls.length).toBe(1);
    
                return new Promise(resolve => setImmediate(resolve)).then(() => {
                    const wrapperOperation = findByDataTest(component, 'formatOperation');
                    expect(wrapperOperation.length).toBe(1);
                    
                    const wrapperEdit = findByDataTest(component, 'operationEdit');
                    wrapperEdit.simulate('click');
                    expect(mockUpdateDevice.mock.calls.length).toBe(1);
    
                    const wrapperDlt = findByDataTest(component, 'operationDlt');
                    wrapperDlt.simulate('click');
                    expect(mockDeleteDevice.mock.calls.length).toBe(1);
                    
                    expect(mockUpdateSelectedDevice.mock.calls.length).toBe(1);
                });
            });
    
            it("formatTableList showOperation -> false: function calling ?", async () => {
                let component;
                const mockGetDevDetails = jest.fn();
                const mockUpdateSelectedDevice = jest.fn();
    
                mockGetDevDetails.mockReturnValueOnce({deviceId:'id1', type:'type1', devFamily:'family1', 
                    subType: 'sub1'}).mockReturnValueOnce({deviceId:'id2', type:'type2', devFamily:'family2', 
                    subType: 'sub2'});      
    
                const props = {
                    showDeviceOprn: false,
                    getDeviceDetails: mockGetDevDetails,
                    updateSelectedDevice: mockUpdateSelectedDevice
                };
    
                component = preConfig(props);
                
                return(component.instance().formatTableList(2)).then(() => {
                    expect(mockGetDevDetails.mock.calls.length).toBe(2);
                    const wrapperOperation = findByDataTest(component, 'sensorTest');
                    expect(wrapperOperation.length).toBe(2);
                    expect(mockUpdateSelectedDevice.mock.calls.length).toBe(1);
                });
            });
        })
        
        describe('getTableStructure', () => {
            it("table Structure shows operation on prop show DeviceOprn boolean true", async () => {
                const props = {
                    showDeviceOprn: true,
                };
    
                const component = shallow(<DeviceList {...props} />);
    
                expect(component.instance().getTableStruture().props.children[0].props.children.props
                    .children[4].props.children).toBe('Operations');
            });
    
            it("table Structure shows device select on prop show DeviceOprn boolean false", async () => {
                const props = {
                    showDeviceOprn: false,
                };
    
                const component = shallow(<DeviceList {...props} />);
    
                expect(component.instance().getTableStruture().props.children[0].props.children.props
                    .children[4]).toBe(false);
            });  
        })
    });
});