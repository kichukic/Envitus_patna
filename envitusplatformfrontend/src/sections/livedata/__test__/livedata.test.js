import React from 'react';
import { shallow } from 'enzyme';
import Livedata from './../livedata';
import { findByDataTest } from '../../../utils';

const preConfig = (props={}) => {
    const component = shallow(<Livedata {...props} />);
    return component;
};

describe('Livedata Test', () => {
    describe('Redering ?' ,() => {
        it('renders Livedata correctly', () => {
            let component;
            component = preConfig(); 
            const wrapper = findByDataTest(component, 'mainLiveDataTag');
            expect(wrapper.length).toBe(1);
        });
    })
})