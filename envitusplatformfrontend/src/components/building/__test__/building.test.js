import React from 'react';
import { shallow } from 'enzyme';
import Building from './../building';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<Building {...props}></Building>);
    return component;
};

describe('Building component Test', () => {
    
    it('renders Carousal components correctly', () => {
        let component;
        component = preConfig(); 
        component.setState({
            building: [{
                id: "testBuilding",
                img: "dummypath",
                alt: "testAltBuilding"
            }]
        });
        const wrapper = findByDataTest(component, 'buildingCarosComponent');
        expect(wrapper.prop('items')).toEqual([{
                id: "testBuilding",
                img: "dummypath",
                alt: "testAltBuilding"
            }]
        );
    });

    it('renders DeviceList components correctly', () => {
        let component;
        component = preConfig(); 
        const wrapper = findByDataTest(component, 'buildingDevicComponent');
        expect(wrapper.prop('listType')).toBe('sensor');
    });
    
});