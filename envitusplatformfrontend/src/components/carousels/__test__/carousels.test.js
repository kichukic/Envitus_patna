import React from 'react';
import { shallow } from 'enzyme';
import Carousels from './../carousels';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<Carousels {...props} />);
    return component;
};

describe('Carousels Test', () => {
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
        const wrapperCarousal = findByDataTest(component, 'carouselComponent');
        expect(wrapperCarousal.length).toBe(1);
        const wrapperCarousalItem = findByDataTest(component, 'carouselItemComponent');
        expect(wrapperCarousalItem.length).toBe(1);
        const wrapperImg = findByDataTest(component, 'ImgComponent');
        expect(wrapperImg.length).toBe(1);
        expect(wrapperCarousal).toMatchSnapshot();
    });

});