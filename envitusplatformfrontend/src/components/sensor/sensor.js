import React from 'react';
import './sensor.scss';
import { connect } from 'react-redux';
import { updateSelectedDevice } from '../../action/deviceAction';
import Overlays from '../overlays/overlays';

export class Sensor extends React.Component {
    constructor(props) {
        super(props);
        this.selectSensor = this.selectSensor.bind(this);
    }

    selectSensor (event) {
        event.preventDefault();
        if(this.props.selectedDevice !== this.props.sensorId){
            this.props.updateSelectedDevice(this.props.sensorId);
        }
    }

    render() {
        let elementReturn;
        if(process.env.REACT_APP_DEVICE_FAMILY === 'Postbox'){
            const serv1 = (this.props.mapDisplay.comp1.isServerd === 'Yes') ? 
                ' and last Served by ' + this.props.mapDisplay.comp1.serverdBy + ' at ' 
                + new Date(parseInt(this.props.mapDisplay.comp1.serverdAt, 10)).toLocaleString()  : ' and Not Served';
            const serv2 = (this.props.mapDisplay.comp2.isServerd === 'Yes') ? 
                ' and last Served by ' + this.props.mapDisplay.comp2.serverdBy + ' at ' 
                + new Date(parseInt(this.props.mapDisplay.comp2.serverdAt, 10)).toLocaleString() : ' and Not Served';
            const comp1Text = (this.props.mapDisplay.comp1.needServ === 'Yes') ? 'Compartment 1 is filled at ' + 
                new Date(this.props.mapDisplay.comp1.timeFilled75).toLocaleString() + serv1 :
                'Fill Percentage of Compartment 1 is Less Than 70' + serv1;
            const comp2Text = (this.props.mapDisplay.comp2.needServ === 'Yes') ? 'Compartment 2 is filled at ' + 
                new Date(this.props.mapDisplay.comp2.timeFilled75).toLocaleString() + serv2 :
                'Fill Percentage of Compartment 2 is Less Than 70' + serv1;
            const hovertext = {head: this.props.sensorId, body : 
                <div>
                    <p className="font-weight-lighter">{comp1Text}</p>
                    <p className="font-weight-lighter">{comp2Text}</p>
                </div>
            }
            let className = 'post';
            if (this.props.sensorId === this.props.selectedDevice) {
                className += ' post-active';
            }
    
            elementReturn = 
            <Overlays hovertext={hovertext}>
                <img src={process.env.PUBLIC_URL + "/img/postbox.svg"} alt="Postbox" 
                    data-test="mailTag" style={this.props.positionStyle} 
                    className={className} onClick={this.selectSensor}
                />
            </Overlays>
        } else {
            if(this.props.mode === "circle") {
                let className = 'dot';
                if (this.props.sensorId === this.props.selectedDevice) {
                    if(this.props.positionStyle.backgroundColor === '#27AE60') {
                        className += ' dot-selected-live';
                    } else {
                        className += ' dot-selected-not-live';
                    }
                }

                if(this.props.currentAQI !== false) {
                    const hovertext = {head: 'AQI', body : 
                        <div>
                            <p className="font-weight-lighter">Date: {this.props.currentAQI.date}</p>
                            <p className="font-weight-lighter">AQI: {this.props.currentAQI.aqi}</p>
                        </div>
                    }
                    elementReturn = 
                    <Overlays hovertext={hovertext} key={this.props.sensorId}>
                        <span data-test="spanTag" style={this.props.positionStyle} 
                            className={className} onClick={this.selectSensor}
                        />
                    </Overlays>
                } else {
                    elementReturn = 
                    <span key={1} data-test="spanTag" style={this.props.positionStyle} 
                        className={className} onClick={this.selectSensor}
                    />
                }
            } else if(this.props.mode === "circle3D") {
                let className = 'spots3d';
                if (this.props.sensorId === this.props.selectedDevice) {
                    className += ' spots3d-active';
                }
                const slot = 'hotspot-' + this.props.positionStyle.slot;

                elementReturn = 
                <button key={2} className={className} slot={slot} data-test="button3DTag"
                    data-position={this.props.positionStyle.position} onClick={this.selectSensor}
                    data-normal={this.props.positionStyle.normal} 
                />
            }
        }
        return (
            [elementReturn]
        );
    }
}

export function mapStateToProps(state) {
    return ({
        selectedDevice: state.devices.selectedDevice
    });
}

export function mapDispatchToProps(dispatch) {
    return ({
        updateSelectedDevice: (id) => {
            return dispatch(updateSelectedDevice(id))
        }    
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(Sensor);
