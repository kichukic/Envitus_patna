import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateFormValue, updateFormValidation } from '../../action/formAction'
import { Row, Col } from 'react-bootstrap';
import LiveDataTable from '../../components/liveDataTable/liveDataTable';

export class AlarmruleDeviceParamDefForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            table: {head: [], body: []},
            showOprn: false,
        }
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        this.initFormData();
    }

    componentDidUpdate(prevProps) {
        if(prevProps !== this.props) {
            if (prevProps.paramDef !== this.props.paramDef) {
                this.initFormData();
            } else {
                this.loadParamDefTable();
            }
        }
    }

    onChange(event, limit, paramName, displayName) {
        const info = {...this.props.alarmruleFrmDta.info};
        info.paramDefs[paramName].displayName = displayName;
        info.paramDefs[paramName][limit]= event.target.value;
        this.props.updateFormValue({info: info});
    }

    initFormData() {
        this.props.paramDef.forEach(param => {
            if(param.isDisplayEnabled) {
                if((this.props.updateType === 'update') &&
                    ((this.props.alarmruleFrmDta.info.paramDefs[param.paramName]) && 
                    (this.props.alarmruleFrmDta.info.paramDefs[param.paramName].displayName === param.displayName))) {
                    this.props.alarmruleFrmDta.info.paramDefs = {...this.props.alarmruleFrmDta.info.paramDefs, ...{[param.paramName]: {
                        displayName: this.props.alarmruleFrmDta.info.paramDefs[param.paramName].displayName, 
                        minLimit: this.props.alarmruleFrmDta.info.paramDefs[param.paramName].minLimit, 
                        maxLimit: this.props.alarmruleFrmDta.info.paramDefs[param.paramName].maxLimit
                    }}};
                } else {
                    this.props.alarmruleFrmDta.info.paramDefs = {...this.props.alarmruleFrmDta.info.paramDefs,
                        ...{[param.paramName]: {displayName: "", minLimit: "", maxLimit: ""}}
                    };
                }
            }
        });
        this.loadParamDefTable();
    }

    loadParamDefTable() {
        const tableHead = ['Parameter', 'Min' ,'Max'];
        const tableBody = [];
        this.props.paramDef.forEach(param => {
            if(param.isDisplayEnabled && param.valueType !== 'date' && param.valueType !== 'string' && param.paramName !== 'GPS') {
                const min = 
                    <input value={this.props.alarmruleFrmDta.info.paramDefs[param.paramName].minLimit} className="w-50"
                        onChange={(e) => this.onChange(e, 'minLimit', param.paramName, param.displayName)} type="number"
                        min={param.maxRanges.min} max={param.maxRanges.max}
                    />
                
                const max = 
                    <input value={this.props.alarmruleFrmDta.info.paramDefs[param.paramName].maxLimit} className="w-50"
                        onChange={(e) => this.onChange(e, 'maxLimit', param.paramName, param.displayName)} type="number"
                        min={this.props.alarmruleFrmDta.info.paramDefs[param.paramName].minLimit} max={param.maxRanges.max}
                    />
                
                const deviceDetails = [param.displayName, min, max];
                tableBody.push(deviceDetails) 
            }
        });
        this.setState({table: {head: tableHead, body: tableBody}})
    }

    render() {
        const alignLeft = true;
        return (
            <div>
                {(this.state.table.body.length > 0) &&
                    <React.Fragment>
                        <Row className="form-sub-heading mt-3">
                            <Col sm={12}>
                                <h5>Parameter Definitions</h5>
                                <hr className="my-3 w-100" />
                            </Col>
                        </Row>
                        <LiveDataTable tableBody={this.state.table.body} tableHead={this.state.table.head} 
                            showOprn={this.state.showOprn} alignLeft={alignLeft}
                        />
                    </React.Fragment>
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return ({
        alarmruleFrmDta: state.formData.data,
        updateType: state.formData.updateType,
        alarmruleFrmValSts: state.formData.deviceFrmValSts
    });
}

function mapDispatchToProps(dispatch) {
    return ({
        updateFormValue: (data) => {
            return dispatch(updateFormValue(data))
        },
        updateFormValidation: (data) => {
            return dispatch(updateFormValidation(data))
        }       
    });
}

export default connect(mapStateToProps, mapDispatchToProps)(AlarmruleDeviceParamDefForm);
