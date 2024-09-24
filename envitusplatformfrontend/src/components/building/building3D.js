import React, { Component } from 'react';
import './building3D.scss';
import { Container } from 'react-bootstrap';
import Carousels3D from '../carousels/carousels3D';

export class Building3D extends Component {
    constructor(props) {
        super(props);
        this.state = {
            building: [{
                id: "building1",
                img: process.env.PUBLIC_URL + "/img/astronaut.glb",
                alt: "building1"
            }]
        };
    }

    render() {
        return (
            <div className="building py-4">
                <Container>
                    <Carousels3D data-test="buildingCarosComponent" items={this.state.building} />    
                </Container>
            </div>
        )
    }
}

export default Building3D
