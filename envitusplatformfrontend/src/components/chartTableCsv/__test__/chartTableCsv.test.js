import React from 'react';
import { shallow } from 'enzyme';
import ChartTableCsv from './../chartTableCsv';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<ChartTableCsv {...props}></ChartTableCsv>);
    return component;
};

describe('ChartTableCsv component Test', () => {
    it('renders ChartTableCsv components correctly', () => {
        let component;
        component = preConfig(); 
        const wrapper = findByDataTest(component, 'main');
        expect(wrapper.length).toBe(1);
    });

    it('renders dataStat form correctly', () => {
        let component;
        const props = {
            isDataStats : true
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'dataStatsForm');
        expect(wrapper.length).toBe(1);
    });

    it('renders dataStat chart Mode correctly', () => {
        let component;
        const props = {
            isDataStats : true,
            chartShown: true
        };
        component = preConfig(props); 
        const wrapper = component.find(`[controlId='chartModeSelect']`);
        expect(wrapper.length).toBe(1);
    });

    it('renders dataStat chart correctly', () => {
        let component;
        const props = {
            isDataStats : true,
            chartShown: true,
            showIntervalIps: true,
            showIntervalChart: true
        };
        component = preConfig(props); 
        const wrapper = findByDataTest(component, 'chart');
        expect(wrapper.length).toBe(1);
    });
});