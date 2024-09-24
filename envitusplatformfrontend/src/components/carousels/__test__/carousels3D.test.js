import React from 'react';
import { shallow } from 'enzyme';
import Carousels3D from './../carousels3D';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<Carousels3D {...props} />);
    return component;
};

describe('Carousels3D Test', () => {
    it('Redering Properly with prop values', () => {
        let component;
        const props = {
            items: [{
                id: "testBuilding",
                img: "dummypath",
                alt: "testAltBuilding"
            }] 
        };
        component = preConfig(props);
        const wrapperMV = findByDataTest(component, 'modelViewComponent');
        expect(wrapperMV.length).toBe(1);
        const wrapperDevice = findByDataTest(component, 'DeviceComponent');
        expect(wrapperDevice.length).toBe(1);
        const wrapperDiv = findByDataTest(component, 'mainDiv');
        expect(wrapperDiv.length).toBe(1);
        expect(wrapperDiv).toMatchSnapshot();
    });

});