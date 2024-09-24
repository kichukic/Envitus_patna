import React, { Component } from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import CsvDownload from 'react-json-to-csv';
import './liveDataDownload.scss';

export class LiveDataDownload extends Component {
    render() {
        return (
            <div data-test="csvDownload">
                <br />
                <p>
                Select start date,end date and format of the data, 
                the press download button
                </p>
                <label>
                    Start Date &nbsp;
                    <input type="date"  
                        onChange={this.props.csvDateHandleChange}
                        name="startDate" 
                    />
                    &nbsp;&nbsp;&nbsp;
                </label>
                
                <label>
                    End Date &nbsp;
                    <input type="date"
                        onChange={this.props.csvDateHandleChange} 
                        name="endDate" 
                    />
                </label>
                
                <br />
                <label>
                Select file Format&nbsp;
                </label>
                <Dropdown>
                    <Dropdown.Toggle variant="success" size="sm" id="dropdown-basic">
                        CSV
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item>CSV</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <br />
                
                {!this.props.csvReadyToDownload &&
                    <Button onClick={this.props.csvInitDownload}
                        variant="outline-success"
                        className="csvBtn"
                    >
                        Initiate Download
                    </Button>
                }

                {this.props.csvReadyToDownload && 
                    <div>
                        <CsvDownload data-test="btnDldFile" data={this.props.csvDownloadData} 
                            filename={this.props.csvFilename} className="csvBtn"
                        >
                            Download File
                        </CsvDownload>
                        
                        <Button style={{marginLeft:7}} onClick={this.props.setReadyToDownloadFalse}
                            className="csvBtn" variant="outline-success"
                        >
                            New Download
                        </Button>
                    </div>
                }
                {this.props.alertMessage}
            </div>
        )
    }
}

export default LiveDataDownload
