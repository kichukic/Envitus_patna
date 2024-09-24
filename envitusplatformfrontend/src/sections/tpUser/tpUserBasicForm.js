import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { tpUserFrmValRgex } from '../../constants';
import { connect } from 'react-redux';
import { updateFormValue, updateFormValidation } from '../../action/formAction';

class DeviceBasicForm extends React.Component {

    constructor(props) {
        super(props);
        
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.updateFormValue({[e.target.name]: e.target.value});
        if(tpUserFrmValRgex[e.target.name] && !tpUserFrmValRgex[e.target.name].test(e.target.value)) {
            this.props.updateFormValidation({[e.target.name]: true});
        } else {
            this.props.updateFormValidation({[e.target.name]: false});
        }
    }

    render() {
        const disableSwitch = (this.props.updateType === 'update') ? true : false;
        return (
            <React.Fragment>
                <Row className="form-sub-heading">
                    <Col sm={12}><h5>Basic Details</h5></Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <Form.Group controlId="name">
                            <Form.Label>Name*</Form.Label>
                            <Form.Control value={this.props.userFrmDta.name}
                                isInvalid={this.props.userFrmValSts.name} disabled={disableSwitch}
                                onChange={this.onChange} name="name" type="text" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Name</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col sm={3}>
                        <Form.Group controlId="limit">
                            <Form.Label>Limit*</Form.Label>
                            <Form.Control value={this.props.userFrmDta.limit}
                                isInvalid={this.props.userFrmValSts.limit} min="0"
                                onChange={this.onChange} name="limit" type="number" required
                            />
                            <Form.Control.Feedback type="invalid">Invalid Limit</Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
            </React.Fragment>
        );
    }
}



function mapStateToProps(state) {
    return ({
        userFrmDta: state.formData.data,
        updateType: state.formData.updateType,
        userFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        updateFormValue: (data) => {
            return dispatch(updateFormValue(data))
        },
        updateFormValidation: (data) => {
            return dispatch(updateFormValidation(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(DeviceBasicForm);
