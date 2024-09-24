import React, { Component } from 'react';
import { Card } from 'react-bootstrap';

export class Cards extends Component {
    render() {
        return (
            <Card className={this.props.styles}>
                <Card.Body className="text-center">
                    <Card.Title>{this.props.content.head}</Card.Title>
                    {this.props.content.subHead &&
                        <Card.Subtitle className="text-muted mb-2">{this.props.content.subHead}</Card.Subtitle>
                    }
                    <Card.Text className="lead">
                        {this.props.content.content}
                    </Card.Text>
                    {this.props.content.divItem}
                </Card.Body>
            </Card>
        )
    }
}

export default Cards
