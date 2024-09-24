import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

export class GoogleMap extends Component {
    render() {
        return (
            <GoogleMapReact
                bootstrapURLKeys={{ key: 'AIzaSyAIxBnZBrLo32r-af2Oti4CqaMOjkj_OkY' }}
                center={this.props.center} defaultZoom={8}
            >
                {this.props.children}
            </GoogleMapReact>
        )
    }
}

export default GoogleMap;

