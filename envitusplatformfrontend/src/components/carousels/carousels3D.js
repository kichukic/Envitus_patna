import React, { Component } from 'react';
import DeviceList from '../devicesList/devicesList';

export class Carousels3D extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.carouselItems = this.props.items.map((item) =>
            <model-viewer className="d-block mx-auto" src={item.img} auto-rotate camera-controls
                alt={item.alt} key={item.id} data-test="modelViewComponent"
            >
                <DeviceList data-test="DeviceComponent" listType="sensor3D"/>
            </model-viewer>    
        );
    }

    render() {
        return (
            <div data-test="mainDiv" >
                {this.state.carouselItems}
            </div>
        )
    }
}

export default Carousels3D
