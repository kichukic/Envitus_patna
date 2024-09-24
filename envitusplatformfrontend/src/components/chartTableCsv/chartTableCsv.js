import React, { Component } from 'react'
import { Accordion, Card, Button, Form, Container } from 'react-bootstrap';
import { MdRefresh } from "react-icons/md";
import { FaCloudRain, FaWind } from "react-icons/fa";
import LiveDataDownload from '../liveDataDownload/liveDataDownload';
import Paginations from '../paginations/paginations';
import DarkOverlays from '../overlays/darkOverlays';
import { Row } from 'react-bootstrap';
import './chartTableCsv.scss';

export class ChartTableCsv extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: 0, 
        }  
    }

    setActive(card) {
        this.setState({active: card})
    }

    render() {
        return (
            <div>
                <Accordion data-test="main" defaultActiveKey="0">
                    <Card>
                        <Card.Header style={{ backgroundColor: 'white' }}>
                            <Accordion.Toggle name="chart" className='ml-2 toggle-button' as={Button} 
                                variant="outline" eventKey="0" active={this.state.active === 0}
                                onClick={() =>{this.props.clickAccordionToogle('chart'); this.setActive(0)}}
                            >
                                Chart
                            </Accordion.Toggle>
                            
                            <Accordion.Toggle name="table" className='ml-3 toggle-button' as={Button} 
                                variant="outline" eventKey="1" active={this.state.active === 1}
                                onClick={() =>{this.props.clickAccordionToogle('table'); this.setActive(1)}}
                            >
                                Table
                            </Accordion.Toggle>
                            
                            <Accordion.Toggle name="download" className='ml-3 toggle-button' as={Button} 
                                variant="outline" eventKey="2" active={this.state.active === 2}
                                onClick={() =>{this.props.clickAccordionToogle('download'); this.setActive(2)}}
                            >
                                Download
                            </Accordion.Toggle>

                            {(process.env.REACT_APP_LIVEDATA_TYPE === 'livedata') && this.props.isDataStats &&
                                this.props.needSpecific &&
                                <DarkOverlays hovertext="Rain" placement="bottom">
                                    <Accordion.Toggle name="specificstat" className='ml-3 toggle-button' as={Button} 
                                        variant="outline" eventKey="3" active={this.state.active === 3}
                                        onClick={() =>{this.props.clickAccordionToogle('specificstat'); this.setActive(3)}}
                                    >
                                        <FaCloudRain />
                                    </Accordion.Toggle>
                                </DarkOverlays> 
                            }

                            {(process.env.REACT_APP_LIVEDATA_TYPE === 'livedata') && this.props.isDataStats &&
                                this.props.needSpecific &&
                                <DarkOverlays hovertext="Wind" placement="bottom">
                                    <Accordion.Toggle name="specificstat" className='ml-3 toggle-button' as={Button} 
                                        variant="outline" eventKey="4" active={this.state.active === 4}
                                        onClick={() =>{this.props.clickAccordionToogle('specificstat'); this.setActive(4)}}
                                    >
                                        <FaWind />
                                    </Accordion.Toggle>
                                </DarkOverlays> 
                            }

                            {(process.env.REACT_APP_LIVEDATA_TYPE === 'livedata') &&
                                <DarkOverlays hovertext="Refresh Data" placement="bottom">
                                    <Button className="float-right" onClick={this.props.initState}>
                                        <MdRefresh/>
                                    </Button>
                                </DarkOverlays>  
                            }

                            {this.props.isDataStats &&
                                <Form data-test="dataStatsForm" inline className="float-right ml-3">
                                    {this.props.chartShown &&
                                        <Form.Group style={{marginRight:7}} controlId="chartModeSelect"
                                            className="pt-sm-3 pt-md-0"
                                        >
                                            <Form.Label>Chart Mode &nbsp;</Form.Label>
                                            {this.props.formSelectDSChartMode}
                                        </Form.Group>    
                                    }

                                    {this.props.chartShown &&
                                        <Form.Group style={{marginRight:7}} controlId="statParamSelect"
                                            className="pt-sm-3 pt-md-0"
                                        >
                                            <Form.Label>Parameter &nbsp;</Form.Label>
                                            {this.props.formSelectDSChart}
                                        </Form.Group>    
                                    }

                                    <Form.Group style={{marginRight:7}} controlId="timeFrameSelect"
                                        className="pt-sm-3 pt-md-0"
                                    >
                                        <Form.Label>Time Frame &nbsp;</Form.Label>
                                        {this.props.formSelectDSTimeFrm}
                                    </Form.Group>
                                </Form>
                            }
                        </Card.Header>   
                    </Card>
                        
                    <Card style={{overflowX: "auto"}}>                      
                        <Accordion.Collapse eventKey="0" className="anim-accordion">
                            <Card.Body data-test="chart">
                                <Container>
                                    {!this.props.isDataStats &&
                                        <div className="mb-5">
                                            {this.props.radioGroupRDChart}
                                            {this.props.alertMessage}
                                        </div>
                                    }
                                    {this.props.isDataStats &&
                                        <div className="mb-4">
                                            <div className="d-flex justify-content-end">
                                                {this.props.showIntervalIps && 
                                                    <div className="mt-4">
                                                        {this.props.formDateDSIntMode}
                                                    </div>
                                                }
                                            </div>
                                            <div className="float-right">
                                                {this.props.radioGroupDSMinMax}
                                            </div>
                                            {this.props.alertMessage}
                                        </div>
                                    } 
                                </Container>
                                {!this.props.showIntervalChart && this.props.chart}
                                {this.props.showIntervalChart && this.props.chartInt}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    
                    <Card style={{overflowX: "auto"}}>
                        <Accordion.Collapse eventKey="1" className="anim-accordion">
                            <Card.Body>
                                <Container>
                                    {this.props.isDataStats && this.props.radioGroupDSTable}
                                    {this.props.isDataStats && this.props.alertMessage}
                                    {this.props.table}
                                </Container>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                    
                    <Card>
                        <Accordion.Collapse eventKey="2" className="anim-accordion">
                            <Card.Body>
                                <LiveDataDownload csvReadyToDownload={this.props.csvReadyToDownload}
                                    csvDateHandleChange={this.props.csvDateHandleChange}
                                    csvInitDownload={this.props.csvInitDownload}
                                    csvDownloadData={this.props.csvDownloadData}
                                    csvFilename={this.props.csvFilename}
                                    setReadyToDownloadFalse={this.props.setReadyToDownloadFalse}
                                    alertMessage={this.props.alertMessage}
                                />
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>

                    {(process.env.REACT_APP_LIVEDATA_TYPE === 'livedata') && this.props.isDataStats &&
                        this.props.needSpecific &&
                        <Card style={{overflowX: "auto"}}>
                            <Accordion.Collapse eventKey="3" className="anim-accordion">
                                <Card.Body>
                                    <Container>
                                        {this.props.cumilTable}
                                    </Container>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    }

                    {(process.env.REACT_APP_LIVEDATA_TYPE === 'livedata') && this.props.isDataStats &&
                        this.props.needSpecific &&
                        <Card style={{overflowX: "auto"}}>
                            <Accordion.Collapse eventKey="4" className="anim-accordion">
                                <Card.Body>
                                    <Container>
                                        <Row>
                                            {this.props.wrStatsChart}
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    }

                    {(this.state.active !== 2) && Boolean(this.props.dataCount) &&
                        <Paginations userCount={this.props.dataCount} limit={this.props.limit}
                            offset={this.props.offset} pagnCallback={this.props.pagnCallback}
                        />
                    }
                </Accordion>
            </div>
        )
    }
}

export default ChartTableCsv
