import React from 'react';
import { shallow } from 'enzyme';
import FormDate from './../formDate';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<FormDate {...props}></FormDate>);
    return component;
};

describe('FormDate component Test', () => {
    it('renders FormDate components correctly', () => {
        let component;
        component = preConfig(); 
        const wrapper = findByDataTest(component, 'dateForm');
        expect(wrapper.length).toBe(1);
    });
});