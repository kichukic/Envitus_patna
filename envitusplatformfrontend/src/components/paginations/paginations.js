import React, { Component } from 'react';
import { Pagination } from 'react-bootstrap';
import './paginations.scss'

export class Paginations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cells: [],
            active: 1,
            maxSize: '',
            endPage: '', 
        }  

        this.setMax = this.setMax.bind(this);
    }

    componentDidMount() {
        this.setMax();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userCount !== this.props.userCount) {
            this.setMax();
        }
    }

    setActive(index) {
        this.setState({active: index}, () => this.loadCells())
    }

    activePrev() {
        if(this.state.active !== 1) {
            this.setState((state) => ({active: state.active - 1}), () => this.loadCells())
        }
    }

    activeNext() {
        if(this.state.active !== Math.ceil(this.props.userCount/this.props.limit)) {
            this.setState((state) => ({active: state.active + 1}), () => this.loadCells())
        }
    }

    setMax() {
        const maxSize = Math.ceil(this.props.userCount/this.props.limit) < 7 ? 
            Math.ceil(this.props.userCount/this.props.limit) : 7;
        this.setState({maxSize: maxSize}, () => this.loadCells());
    }

    loadCells() {
        const cells = [];
        const condition = ((Math.ceil(this.props.userCount/this.props.limit) - this.state.active) < this.state.maxSize);
        const startPage = condition ? (Math.ceil(this.props.userCount/this.props.limit)-this.state.maxSize + 1) : (this.state.active);
        const endPage = condition ? Math.ceil(this.props.userCount/this.props.limit) : (this.state.maxSize + this.state.active - 1);
        for (let index = startPage; index <= endPage; index++) {
            cells.push(
                <Pagination.Item key={index} active={index === this.state.active} style={{width: '40px'}}
                    onClick={() => {this.gotoPage(index); this.setActive(index)}} className="text-center"
                >
                    {index}
                </Pagination.Item>
            )
        }
        this.setState({cells: cells, endPage: endPage})
    }

    prevPage() {
        if(this.props.offset !== 0) {
            const newOffset = this.props.offset - this.props.limit;
            this.setState({offset: newOffset});
            if(this.props.type) {
                this.props.pagnCallback(this.props.type, newOffset);
            } else {
                this.props.pagnCallback(newOffset);
            }
        }
    }

    nextPage() {
        if(this.props.offset !== ((Math.ceil(this.props.userCount/this.props.limit)) - 1) * this.props.limit) {
            const newOffset = this.props.offset + this.props.limit;
            this.setState({offset: newOffset});
            if(this.props.type) {
                this.props.pagnCallback(this.props.type, newOffset);
            } else {
                this.props.pagnCallback(newOffset);
            }
        }
    }

    gotoPage(index) {
        const newOffset = (index - 1) * this.props.limit;
        this.setState({offset: newOffset});
        if(this.props.type) {
            this.props.pagnCallback(this.props.type, newOffset);
        } else {
            this.props.pagnCallback(newOffset);
        }
    }

    render() {
        const startEllipse = (this.state.maxSize === 7) ? 1 : 7;
        return (
            <Pagination className="mt-2 float-right shadow">
                <Pagination.Prev onClick={() => {this.prevPage(); this.activePrev()}}/>
                {(this.state.active > startEllipse) &&
                    <Pagination.Ellipsis />
                }
                {this.state.cells}
                {(Math.ceil(this.props.userCount/this.props.limit) > this.state.endPage) &&
                    <Pagination.Ellipsis />
                }
                <Pagination.Next onClick={() => {this.nextPage(); this.activeNext()}}/>
            </Pagination>
        )
    }
}

export default Paginations
