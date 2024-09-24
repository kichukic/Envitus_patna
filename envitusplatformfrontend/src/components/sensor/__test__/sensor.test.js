import React from 'react';
import { shallow } from 'enzyme';
import { Sensor, mapStateToProps, mapDispatchToProps  } from './../sensor';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<Sensor {...props} />);
    return component;
};

describe('Sensor Test', () => {
    describe('Sensor Test Suite 1', () => {

        it('sensorid != selected sensor : mode Circle', () => {
            let component;
            const props = {
                sensorId: '123',
                selectedDevice: '1234',
                mode: 'circle' 
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'spanTag');
            expect(wrapper.length).toBe(1);
            expect(wrapper.prop('className')).toBe('dot');
        });
    
        it('sensorid = selected sensor : mode Circle', () => {
            let component;
            const props = {
                sensorId: '123',
                selectedDevice: '123',
                mode: 'circle' 
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'spanTag');
            expect(wrapper.length).toBe(1);
            expect(wrapper.prop('className')).toBe('dot dot-active');
        });

        it('sensorid != selected sensor : mode button', () => {
            let component;
            const props = {
                sensorId: '123',
                selectedDevice: '1234',
                mode: 'button' 
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'buttonTag');
            expect(wrapper.length).toBe(1);
            expect(wrapper.prop('className')).toBe('selectButton');
        });
    
        it('sensorid = selected sensor : mode button', () => {
            let component;
            const props = {
                sensorId: '123',
                selectedDevice: '123',
                mode: 'button' 
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'buttonTag');
            expect(wrapper.length).toBe(1);
            expect(wrapper.prop('className')).toBe('selectButton selectButton-active');
        });

        it('sensorid != selected sensor : mode circle3D', () => {
            let component;
            const props = {
                sensorId: '123',
                selectedDevice: '1234',
                mode: 'circle3D',
                positionStyle: {slot: 'slot'}  
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'button3DTag');
            expect(wrapper.length).toBe(1);
            expect(wrapper.prop('className')).toBe('spots3d');
        });
    
        it('sensorid = selected sensor : mode circle3D', () => {
            let component;
            const props = {
                sensorId: '123',
                selectedDevice: '123',
                mode: 'circle3D',
                positionStyle: {slot: 'slot'} 
            };
            component = preConfig(props);
            const wrapper = findByDataTest(component, 'button3DTag');
            expect(wrapper.length).toBe(1);
            expect(wrapper.prop('className')).toBe('spots3d spots3d-active');
        });
    });


    describe('State Dispach Prop', () => {
        it('should show previously selected device', () => {
            const initialState = {
                devices: {
                    selectedDevice: 'device1'
                }
            };
            expect(mapStateToProps(initialState).selectedDevice).toBe('device1');
        });

        it('should update selected device', () => {
            const dispatch = jest.fn();
            mapDispatchToProps(dispatch).updateSelectedDevice();
            expect(dispatch.mock.calls[0][0]).toEqual({ type: 'UPDATE_SELECTED_DEVICE'});
        });
    });


    describe('Event handler for mode circle', () => {
        let component;
        beforeEach(() =>{
            const props = {
                selectedDevice: 'device1',
                sensorId: 'device1',
                mode: 'circle'
            };
            component = preConfig(props); 
        });


        it('selectSensor-mockevent returns correct className', () => {
            const mockEvent = {
                preventDefault: jest.fn()
            };

            component.instance().selectSensor(mockEvent);
            expect(component.props("updateSelectedDevice").className).toEqual("dot dot-active");
        });

    });

    describe('Event handler for mode button', () => {
        let component;
        beforeEach(() =>{
            const props = {
                selectedDevice: 'device1',
                sensorId: 'device1',
                mode: 'button'
            };
            component = preConfig(props); 
        });


        it('selectSensor-mockevent returns correct className', () => {
            const mockEvent = {
                preventDefault: jest.fn()
            };

            component.instance().selectSensor(mockEvent);
            expect(component.props("updateSelectedDevice").className)
                .toEqual("selectButton selectButton-active");
        });
    });


    describe('Event handler for mode circle3D', () => {
        it('selectSensor-mockevent returns correct className', () => {
            let component;

            const props = {
                selectedDevice: 'device1',
                sensorId: 'device1',
                mode: 'circle3D',
                positionStyle: {slot: 'slot'}
            };
            
            component = preConfig(props);

            const mockEvent = {
                preventDefault: jest.fn()
            };

            component.instance().selectSensor(mockEvent);
            expect(component.props("updateSelectedDevice").className)
                .toEqual("spots3d spots3d-active");
        });
    });

    describe('function test', () => {
        it("updateSelectedDevice if selectedDevice prop !== sensorId prop", () => {
            let component;
            const mockCall = jest.fn();
            
            const props = {
                selectedDevice: 'device1',
                sensorId: 'device',
                updateSelectedDevice: mockCall
            };

            const mockEvent = {
                preventDefault: jest.fn()
            };

            component = preConfig(props);

            component.instance().selectSensor(mockEvent);
            expect(mockCall.mock.calls.length).toBe(1);
        });
    });

});
