import React from 'react';
import { shallow } from 'enzyme';
import Home from './../home';
import { findByDataTest } from '../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<Home {...props} />);
    return component;
};

describe('Home Test', () => {
    describe('Redering ?' ,() => {
        it('renders Home correctly', () => {
            let component;
            component = preConfig(); 
            const wrapper = findByDataTest(component, 'mainHomeTag');
            expect(wrapper.length).toBe(1);
        });
    })
})