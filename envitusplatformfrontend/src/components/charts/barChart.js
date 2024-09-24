import React, { Component } from 'react';
import { Bar } from 'react-chartjs-2';

export class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        if (this.props.chartData === '') {
            return null;
        }

        const options = {
            responsive: true,
            legend: { display: false }
        }

        return (    
            <div>
                <Bar data={this.props.chartData} options={options} />
            </div>
        );
    }
}

export default BarChart
