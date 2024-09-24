import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import './doughnutChart.scss';

export class DoughnutChart extends Component {
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
            maintainAspectRatio: false,
            cutoutPercentage: 88,
            animation: {
                animationRotate: true,
                duration: 2000
            },
            legend: {
                display: false
            },
            tooltips: {
                enabled: false
            }
        }

        return (
            <div>
                <Doughnut data={this.props.chartData} options={options} width={90} height={90}/>
                <p className="text-center chart-info lead">{this.props.text}</p>
            </div>
        );
    }
}

export default DoughnutChart
