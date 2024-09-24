import React from 'react';
import Carousel from 'react-bootstrap/Carousel'

class Carousels extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.carouselItems = this.props.items.map((item) =>
            <Carousel.Item data-test="carouselItemComponent" key={item.id}>
                <img data-test="ImgComponent" className="d-block mx-auto"
                    src={item.img}
                    alt={item.alt}
                />
                {this.props.children}
            </Carousel.Item>
        );
    }
    render() {    
        return (
            <Carousel data-test="carouselComponent">
                {this.state.carouselItems}
            </Carousel>
        );
    }
}

export default Carousels; 
