import React from 'react';
import Alert from 'react-bootstrap/Alert'

class AlertBox extends React.Component {
       
    render() {

        if (!this.props.show) {
            return null;
        }

        return (    
            <Alert data-test="alertComponent" variant={this.props.variant} onClose={this.props.close} dismissible>
                { this.props.text || "Some error occured" }
            </Alert>
        );
    }
}

export default AlertBox
