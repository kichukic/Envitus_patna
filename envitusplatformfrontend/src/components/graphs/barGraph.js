import React, { Component } from 'react';
import { select, axisBottom, axisLeft, scaleLinear, scaleBand } from 'd3';
import './barGraph.scss';
import { processGraphArrays } from '../../utils/graphUtil';

export class BarGraph extends Component {
    constructor(props){
        super(props)
        this.state = {
            node: React.createRef(),
        };
    }

    componentDidMount = () => {
        this.drawChart();
    }

    componentDidUpdate = () => {
        select(this.state.node.current)
            .select("rect")
            .remove();  
        this.drawChart(); 
    }

    drawChart = () => {
        const graphDatas = this.props.graphDatas;
        const node = this.state.node.current;
        const graphInputArrays = processGraphArrays(graphDatas.name, graphDatas.value, graphDatas.dates,
            0, graphDatas.color
        );
        const xScale = scaleBand();
        const yScale = scaleLinear();

        xScale.domain(graphDatas.dates)
            .range([25, 275]).padding(0.5);

        yScale.domain([Math.min(...graphDatas.value) - 20, Math.max(...graphDatas.value) + 20])
            .range([50, 0]);

        const xAxis = axisBottom(xScale);
        const yAxis = axisLeft(yScale);

        const xAxisCall = select(node)
            .select(".x-axis")
            .style("transform", "translateY(" + 50 + "px)")

        const yAxisCall = select(node)

        xAxisCall.call(xAxis)
            .style("stroke-dasharray", ("3, 3"))
            .selectAll(".tick").remove()

        yAxisCall.select(".y-axis")
            .style("transform", "translateX(" + 20 + "px)")
            .call(yAxis.ticks(3));

        select(node)
            .selectAll(".bar" + graphDatas.name)
            .data(graphInputArrays.datesValues)
            .join("rect")
            .attr("class", "bar" + graphDatas.name)
            .attr("x", value => xScale(value.date))
            .attr("y", value => yScale(value.paramValue))
            .attr("width", xScale.bandwidth())
            .attr("height", value => (50 - yScale(value.paramValue)))
            .style("transform", "translateY(" + 0 + "px)")
            .attr("fill", value => "#" + value.limitColor)
            .on("mouseenter", (value, index) => {
                const tooltip = select(node)
                    .selectAll(".tooltip" + graphDatas.name)
                    .data([value])

                tooltip.join("text")
                    .attr("class", "tooltip" + graphDatas.name)
                    .text(value.date)
                    .attr("x", xScale(value.date))
                    .attr("y", 75)
                    .attr("font-size", "10px")
                    .attr("text-anchor", "middle");

                tooltip.join("text")
                    .attr("class", "tooltip" + graphDatas.name)
                    .text(value.paramValue)
                    .attr("x", xScale(value.date))
                    .attr("y", 65)
                    .attr("font-size", "10px")
                    .attr("text-anchor", "middle");
            })
            .on("mouseleave", () => select(node).selectAll(".tooltip" + graphDatas.name).remove())
    }

    render() {
        return (
            <svg ref={this.state.node}>
                <g className="x-axis" />
                <g className="y-axis" />
            </svg> 
        )
    }
}

export default BarGraph
