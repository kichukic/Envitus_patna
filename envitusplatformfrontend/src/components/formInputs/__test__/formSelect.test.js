import React from 'react';
import { shallow } from 'enzyme';
import FormSelect from './../formSelect';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<FormSelect {...props}></FormSelect>);
    return component;
};

describe('FormSelect component Test', () => {
    it('renders FormSelect components correctly', () => {
        let component;
        const props = {
            index : [{param: 'Param', value: 'value'}]
        };
        component = preConfig(props);
        const wrapper = findByDataTest(component, 'selForm');
        expect(wrapper.length).toBe(1);
    });
});