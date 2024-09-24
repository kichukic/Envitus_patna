import React, { Component } from 'react';
import { Container } from 'react-bootstrap';

import DeviceTable from '../../components/devicesList/deviceTable';
import RawData from './rawData';
import DataStats from './dataStats';
import './livedata.scss';

export class Livedata extends Component {
    render() {
        const hideOprn = true; const hideDeact = true; const enableSltDev = true;
        return (
            <div data-test="mainLiveDataTag">
                <DeviceTable hideOprn={hideOprn} hideDeact={hideDeact} enableSltDev={enableSltDev} />

                <Container responsive="lg" className="container py-4">
                    <h2>Data Statistics</h2>
                    <DataStats />
                </Container>

                <Container responsive="lg" className="container py-4">
                    <h2>Raw Data</h2>
                    <RawData />
                </Container>
            </div>
        )
    }
}

export default Livedata
