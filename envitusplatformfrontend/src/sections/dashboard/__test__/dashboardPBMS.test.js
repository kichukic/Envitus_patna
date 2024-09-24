import React from 'react';
import { shallow } from 'enzyme';
import Dashboard from './../dashboardPBMS';
import { findByDataTest } from '../../../utils';

const preConfig = (props={}) => {
    const component = shallow(<Dashboard {...props} />);
    return component;
};

describe('Dashboard Test', () => {
    describe('Redering ?' ,() => {
        it('renders DashB correctly', () => {
            let component;
            component = preConfig(); 
            const wrapper = findByDataTest(component, 'pbmsdashTag');
            expect(wrapper.length).toBe(1);
        });
    })
})