import React from 'react';
import { shallow } from 'enzyme';
import RadioGroup from './../radioGroup';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<RadioGroup {...props}></RadioGroup>);
    return component;
};

describe('RadioGroup component Test', () => {
    it('renders RadioGroup components correctly', () => {
        let component;
        const props = {
            index : [{param: 'Param', value: 'value'}]
        };
        component = preConfig(props);
        const wrapper = findByDataTest(component, 'radioGroup');
        expect(wrapper.length).toBe(1);
    });
});