import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './home.scss';
import Login from '../../components/login/login';


class Home extends React.Component {
    render() {
        return (
            <Container data-test="mainHomeTag" className="vh-100 d-flex align-items-center">
                <Row className="rowWidth">
                    <Col lg={8} className="logo">
                        <img src={process.env.PUBLIC_URL + process.env.REACT_APP_HOME_LOGO} alt="logo" />
                    </Col>
                    <Col lg={4}>
                        <div className="login">
                            <Login />
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Home;
