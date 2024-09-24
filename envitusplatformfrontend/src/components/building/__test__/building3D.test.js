import React from 'react';
import { shallow } from 'enzyme';
import Building3D from './../building3D';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<Building3D {...props}></Building3D>);
    return component;
};

describe('Building3D component Test', () => {
    
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
    
});