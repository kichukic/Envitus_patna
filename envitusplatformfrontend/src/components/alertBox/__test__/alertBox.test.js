import React from 'react';
import { shallow } from 'enzyme';
import AlertBox from './../alertBox';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<AlertBox {...props}></AlertBox>);
    return component;
};

describe('Alert Test', () => {
    
    it('renders Alert if warning is true', () => {
        let component;
        const props = {
            show: true
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'alertComponent');
        expect(wrapper.length).toBe(1);
    });

    it('do not renders Alert if warning is false', () => {
        let component;
        const props = {
            show: false
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'alertComponent');
        expect(wrapper.length).toBe(0);
    });

    it('do not renders Alert if warning isnt predefined to a boolean value', () => {
        let component;
        component = preConfig(); 
        const wrapper = findByDataTest(component, 'alertComponent');
        expect(wrapper.length).toBe(0);
    });
    
    it('render variant value as desired', () => {
        let component;
        const props = {
            show : true,
            variant: 'danger'
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'alertComponent');
        expect(wrapper.prop('variant')).toBe('danger');
    });

    it('render text as desired when text is defined in prop', () => {
        let component;
        const props = {
            show : true,
            text: 'this is a test'
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'alertComponent');
        expect(wrapper.text()).toEqual('this is a test');
    });
    
    it('render text as desired when text is not defined in prop', () => {
        let component;
        const props = {
            show : true
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'alertComponent');
        expect(wrapper.text()).toEqual('Some error occured');
    });
});