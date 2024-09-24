import React from 'react';
import { pie, arc } from 'd3-shape';
import { select } from 'd3-selection';

class SemiCircleChart extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            node: React.createRef(),
        };
        this.createChart = this.createChart.bind(this);
    }

    componentDidMount() {
        this.createChart()
    }

    componentDidUpdate() {
        select(this.state.node.current)
            .select("g")
            .remove();
        this.createChart()
    }

    createChart() {
        const node = this.state.node.current;
        
        const value = ((this.props.value-this.props.min)/(this.props.max-this.props.min));
        const data = [value, 1 - value];

        const bBox = node.getBBox();
        let width = bBox.width;
        let height = bBox.height;

        const anglesRange = 0.5 * Math.PI;
        const colors = ["#" + this.props.color, "#F5F5F5"];
        const pies = pie()
            .value( d => d)
            .sort(null)
            .startAngle( anglesRange * -1)
            .endAngle( anglesRange)

        
        width = node.width.baseVal.value;
        height = node.height.baseVal.value;
        const radis = Math.min(width, 2 * height) / 2
        const arcs = arc()
            .outerRadius(radis)
            .innerRadius(radis - 30)
    
        const translation = (x, y) => `translate(${x}, ${y})`

        select(node)
            .append("g")
            .attr("transform", translation(width / 2, Math.min(150 , height)));
        
        
        select(node)
            .select("g")
            .selectAll("path")
            .data(pies(data))
            .enter()
            .append("path")
            .attr("fill", (d, i) => colors[i])
            .attr("d", arcs);
        
        select(node)
            .select("g")
            .append("text")
            .html( d => Math.round(this.props.value) + this.props.unit)
            .attr("dy", "-1rem")
            .attr("text-anchor", "middle");
    }

    render() {
        return (<svg data-test="semiCircleComponent" ref={this.state.node} />);
    }
}

export default SemiCircleChart;
