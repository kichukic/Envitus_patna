import React from 'react';
import Carousels from '../carousels/carousels';
import DeviceList from '../devicesList/devicesList';
import './building.scss'

class Building extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            building: [{
                id: "building1",
                img: process.env.PUBLIC_URL + "/img/building1.jpg",
                alt: "building1"
            }]
        };
    }

    render() {
        return (
            <div className="building py-4">
                <Carousels data-test="buildingCarosComponent" items={this.state.building}>
                    <DeviceList data-test="buildingDevicComponent" listType="sensor"/>
                </Carousels>
                
            </div>
        );
    }
}

export default Building;
