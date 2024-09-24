import React from 'react';
import { Form } from 'react-bootstrap';
import { userFrmValRgex } from '../../constants';
import { connect } from 'react-redux';
import { updateFormValue, updateFormValidation } from '../../action/formAction';

class RegisterForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
        }
        
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        this.props.updateFormValue({[e.target.name]: e.target.value});
        if(userFrmValRgex[e.target.name] && !userFrmValRgex[e.target.name].test(e.target.value)) {
            this.props.updateFormValidation({[e.target.name]: true});
        } else {
            this.props.updateFormValidation({[e.target.name]: false});
        }
    }

    render() {
        return (
            <React.Fragment>
                <Form.Group controlId="name">
                    <Form.Control value={this.props.userFrmDta.name}
                        isInvalid={this.props.userFrmValSts.name} placeholder="Name"
                        onChange={this.onChange} name="name" type="text" required
                    />
                    <Form.Control.Feedback type="invalid">Invalid Name</Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="email">
                    <Form.Control value={this.props.userFrmDta.email}
                        isInvalid={this.props.userFrmValSts.email} placeholder="Email"
                        onChange={this.onChange} name="email" type="email" required
                    />
                    <Form.Control.Feedback type="invalid">Invalid Email</Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="contact">
                    <Form.Control value={this.props.userFrmDta.contact}
                        isInvalid={this.props.userFrmValSts.contact} placeholder="Contact"
                        onChange={this.onChange} name="contact" type="text" required
                    />
                    <Form.Control.Feedback type="invalid">Invalid Contact</Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="userName">
                    <Form.Control value={this.props.userFrmDta.userName} placeholder="Username"
                        isInvalid={this.props.userFrmValSts.userName}
                        onChange={this.onChange} name="userName" type="text" required
                    />
                    <Form.Control.Feedback type="invalid">Invalid Username</Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Control value={this.props.userFrmDta.password}
                        isInvalid={this.props.userFrmValSts.password} placeholder="Password"
                        onChange={this.onChange} name="password" type="password" required
                    />
                    <Form.Control.Feedback type="invalid">
                        Invalid Password !! Should be atleast 8 in length and should contain atleast 1 alphabet and a number
                    </Form.Control.Feedback>
                </Form.Group>
            </React.Fragment>
        );
    }
}



function mapStateToProps(state) {
    return ({
        userFrmDta: state.formData.data,
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

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
