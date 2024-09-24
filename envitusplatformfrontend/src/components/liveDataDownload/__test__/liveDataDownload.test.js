import React from 'react';
import { shallow } from 'enzyme';
import LiveDataDownload from './../liveDataDownload';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<LiveDataDownload {...props}></LiveDataDownload>);
    return component;
};

describe('LiveDataDownload component Test', () => {
    it('renders LiveDataDownload components correctly', () => {
        let component;
        component = preConfig(); 
        const wrapper = findByDataTest(component, 'csvDownload');
        expect(wrapper.length).toBe(1);
    });

    it('renders dataStat form correctly', () => {
        let component;
        const props = {
            csvReadyToDownload : true
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'btnDldFile');
        expect(wrapper.length).toBe(1);
    });
});