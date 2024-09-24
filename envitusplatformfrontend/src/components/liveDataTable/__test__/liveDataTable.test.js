import React from 'react';
import { shallow } from 'enzyme';
import LiveDataTable from './../liveDataTable';
import { findByDataTest } from './../../../Utils';

const preConfig = (props={}) => {
const component = shallow(<LiveDataTable {...props}></LiveDataTable>);
    return component;
};

describe('LiveDataTable component Test', () => {
    it('renders LiveDataTable components correctly', () => {
        let component;
        const props = {
            tableHead: ['head1', 'head2'],
            tableBody: [['content1', 'content2']] 
        };
        component = preConfig(props);
        const wrapper = findByDataTest(component, 'dataTable');
        expect(wrapper.length).toBe(1);
    });
});