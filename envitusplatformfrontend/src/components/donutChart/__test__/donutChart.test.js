import React from 'react';
import { shallow } from 'enzyme';
import DonutChart from './../donutChart';
import { findByDataTest } from '../../../Utils';

const preConfig = (props={}) => {
    const component = shallow(<DonutChart {...props} />);
    return component;
};

describe('DonutChart Test', () => {
    it('snapshot', () => {
        const wrapper = shallow(<DonutChart/>);   
        expect(wrapper).toMatchSnapshot();
    });

    it('Redering Properly with prop values', () => {
        let component;
        component = preConfig();
        const wrapper = findByDataTest(component, 'semiCircleComponent');
        expect(wrapper.length).toBe(1);
    });

    it('draws Chart', () => {
        let component;
        const props = {
            value: 20,
            max: 50,
            min: 2,
            unit: "mg",
            color: "F5F5F5"
        };
        component = preConfig(props);
        component.setState({
            node: React.createRef()
        });
        expect(component.instance().render().ref.current).toBe(null);  
    })
});