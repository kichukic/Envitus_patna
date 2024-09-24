import React, { Component } from 'react';
import { select, line, axisBottom, axisLeft, axisRight, scaleLinear, scalePoint } from 'd3';
import { Container } from 'react-bootstrap';
import './lineGraph.scss';
import { processGraphArrays, setYaxisAttr } from '../../utils/graphUtil';
import { capitalize } from '../../utils/index';

export class LineGraph extends Component {
    constructor(props){
        super(props)
        this.state = {
            node: React.createRef(),
        };
    }

    componentDidMount = () => {
        select(this.state.node.current)
            .select("path")
            .remove();
        select(this.state.node.current)
            .select("circle")
            .remove();
        this.initChartDraw();
    }

    componentDidUpdate = () => {
        select(this.state.node.current)
            .select("path")
            .remove();
        select(this.state.node.current)
            .select("circle")
            .remove();   
        this.initChartDraw(); 
    }

    initChartDraw = () => {
        const graphDatas = this.props.graphDatas;
        let iteration = 0;
        const legends = this.getLegends(graphDatas);
        graphDatas.forEach(element => {
            this.drawChart(element.name, element.value, element.dates, iteration++, legends);
        });
    }

    getLegends(attribute) {
        const width = (this.props.isDataStats) ? 500 : 500 - ((attribute.length - 2)* 50); 
        const constant = 6;
        const sum = attribute.reduce((a, b) => a + (b.name ? b.name.length : 0), 0);
        let prevPos = (width/2) - (((sum + 2)/2) * constant)
        const legends = [prevPos];
        for (let index = 1; index < attribute.length; index++) {
            const currentPos = prevPos + (constant * (attribute[index -1].name.length + (constant + 1)));
            prevPos = currentPos;
            legends.push(currentPos)
        }
        return legends;
    }

    drawChart = (chartName, chartValue, chartDates, countIteration, legends) => {
        const node = this.state.node.current;
        const graphInputArrays = processGraphArrays(chartName, chartValue, chartDates, countIteration);
        const rangeVals = this.props.minMaxAvgFullVal;
        
        const xScale = scalePoint();
        const yScale = scaleLinear();
        const colorScale =  scaleLinear();

        xScale.domain(chartDates)
            .range([25, 550]);

        if(this.props.isDataStats) {
            yScale.domain([Math.min(...rangeVals) - 20, Math.max(...rangeVals) + 20])
                .range([250, 0]);

            colorScale.domain([Math.min(...rangeVals) - 20, Math.max(...rangeVals) + 20])
                .range(["green","red"]);      
        }
        
        else {
            yScale.domain([Math.min(...chartValue) - 20, Math.max(...chartValue) + 20])
                .range([250, 0]);

            colorScale.domain([Math.min(...chartValue) - 20, Math.max(...chartValue) + 20])
                .range(["green","red"]);    
        }

        const yaxisAttr = setYaxisAttr(countIteration);     

        const xAxis = axisBottom(xScale);
        const yAxis = (this.props.isDataStats) ? axisLeft(yScale) : 
            (((countIteration % 2) === 0) ? axisLeft(yScale) : axisRight(yScale));

        const xAxisCall = select(node)
            .select(".x-axis")
            .style("transform", "translateY(" + 250 +"px)")

        xAxisCall.call(xAxis)
            .selectAll(".tick > text")
            .style("font-size", "7px")
            .attr("transform", "rotate(-30)");

        const yAxisCall = select(node)   

        if(this.props.isDataStats) {                
            yAxisCall.select(".y1-axis")
                .style("transform", "translateX(" + 0 +"px)")
                .call(yAxis.ticks(5));  
        }

        else {
            yAxisCall.select(yaxisAttr.yAxisName)
                .style("transform", "translateX(" + yaxisAttr.transformAmt +"px)")
                .call(yAxis.ticks(5));
        }

        const myLine = line()
            .x(value => xScale(value.date))
            .y(value => yScale(value.paramValue));  

        select(node)
            .selectAll(".line" + chartName )
            .data([graphInputArrays.datesValues])
            .join("path")
            .attr("class", "line" + chartName)
            .attr("d", value => myLine(value))
            .attr("fill", "none")
            .attr("stroke", yaxisAttr.strokeColor)

        select(node)
            .selectAll(".circle" + chartName)
            .data(graphInputArrays.datesValues)
            .join("circle")
            .attr("class", "circle" + chartName)
            .attr("r", 3)
            .attr("cx", value => xScale(value.date)) 
            .attr("cy", value => yScale(value.paramValue))
            .attr("stroke", yaxisAttr.strokeColor)
            .attr("fill", "white")
            .on("mouseenter", (value, index) => {
                select(node)
                    .selectAll(".tooltip" + chartName)
                    .data([value])
                    .join("text")
                    .attr("class", "tooltip" + chartName)
                    .text(value.paramValue)
                    .attr("x", xScale(value.date))
                    .attr("y", yScale(value.paramValue) - 5)
                    .attr("text-anchor", "middle")
            })
            .on("mouseleave", () => select(node).selectAll(".tooltip" + chartName).remove())

        const rotateAxisLabel = ((countIteration % 2) === 0) ? "rotate(-90)" : "rotate(90)";
        const dxAxisLabel = ((countIteration % 2) === 0) ? "-1em" : "4em";

        if(!this.props.isDataStats) {
            select(node)
                .selectAll(yaxisAttr.yAxisName)
                .data(graphInputArrays.countParamName)
                .append("text")
                .text(function(d){return d.name})
                .attr("fill", yaxisAttr.strokeColor)
                .style("font", "15px times")
                .style("text-anchor", "end")
                .attr("dx", dxAxisLabel)
                .attr("dy", "-2em")
                .attr("transform", rotateAxisLabel);
        }  else if(countIteration === 0){
            const yAxisName = [{name: this.props.yAxisName}];
            select(node)
                .selectAll(yaxisAttr.yAxisName)
                .data(yAxisName)
                .append("text")
                .text(function(d){return d.name})
                .attr("fill", yaxisAttr.strokeColor)
                .style("font", "15px times")
                .style("text-anchor", "end")
                .attr("dx", dxAxisLabel)
                .attr("dy", "-2em")
                .attr("transform", rotateAxisLabel);
            
            select(node)
                .selectAll(".x-axis")
                .append("text")
                .text(capitalize(this.props.timeFrame))
                .attr("fill", yaxisAttr.strokeColor)
                .style("font", "15px times")
                .style("text-anchor", "end")
                .attr("dx", "37em")
                .attr("dy", "40px")
        }

        const legend = select(node)
            .selectAll(".legend" + chartName)
            .data(graphInputArrays.countParamName)

        const legendEnter = legend.enter().append("g")

        legendEnter.append("circle")
            .attr("class", "legend" + chartName)
            .attr("r", 5)
            .attr("fill", yaxisAttr.strokeColor)
            .attr("cy", -20)
            .attr("cx", legends[countIteration])

        legendEnter.append("text")
            .text(function(d){return d.name})
            .attr("fill", yaxisAttr.strokeColor)
            .attr("dy", -15)
            .attr("dx", legends[countIteration] + 5)
    }

    render() {
        return (
            <div data-test="lineGraph">
                <Container>
                    <svg data-test="lineGraphComponent" className="wholeSvg" height="250" 
                        width="500" viewBox="0 0 500 250" ref={this.state.node}
                    >
                        <g className="x-axis" />
                        <g className="y1-axis" />
                        <g className="y2-axis" />
                        <g className="y3-axis" />
                        <g className="y4-axis" />
                    </svg> 
                </Container>
            </div>
        )
    }
}

export default LineGraph
