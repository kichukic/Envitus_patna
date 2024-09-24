import React from 'react';
import { shallow } from 'enzyme';
import LineGraph from './../lineGraph';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<LineGraph {...props}></LineGraph>);
    return component;
};

describe('LineGraph component Test', () => {
    it('renders LineGraph components correctly', () => {
        let component;
        component = preConfig();
        const wrapper = findByDataTest(component, 'lineGraph');
        expect(wrapper.length).toBe(1);
    });
});