import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from 'react-bootstrap';
import ScrollBar from "react-perfect-scrollbar";
import { MdModeEdit, MdDelete, MdSettingsBackupRestore, MdRemoveRedEye } from "react-icons/md";
import './liveDataTable.scss';

export class LiveDataTable extends Component {
    render() {
        const insertTableHead = [];
        const insertTableBody = [];

        for (let row = 0; row < this.props.tableBody.length; row++) {
            const td = [];

            for (let column = 0; column < this.props.tableHead.length; column++) {
                if (!row) {
                    insertTableHead.push(
                        <th className="stickyHead" key={this.props.tableHead[column]}>{this.props.tableHead[column]}</th>
                    );
                }
                if (this.props.showOprn) {
                    if (column === (this.props.tableHead.length - 1)) {
                        td.push(
                            <td className="d-flex justify-content-start" key={this.props.tableBody[row][1]}>
                                <summary>
                                    <MdModeEdit onClick={() => this.props.onEdit(this.props.tableBody[row][1])}
                                        className="oprnClass"
                                    />
                                </summary>
                                <summary className="ml-1">
                                    <MdDelete onClick={() => this.props.onDelete(this.props.tableBody[row][1])}
                                        className="oprnClass"
                                    />
                                </summary>
                                {(Boolean(this.props.restore)) &&
                                    <summary className="ml-1">
                                        <MdSettingsBackupRestore className="oprnClass"
                                            onClick={() => this.props.onRestore(this.props.tableBody[row][1])}
                                        />
                                    </summary>
                                }
                                <summary className="ml-1">
                                    <MdRemoveRedEye onClick={() => this.props.onView(this.props.tableBody[row][1])}
                                        className="oprnClass"
                                    />
                                </summary>
                            </td>
                        )
                    } else {
                        td.push(
                            <td className="font-weight-light" key={column}>
                                {this.props.tableBody[row][column]}
                            </td>
                        );
                    }
                } else {
                    td.push(
                        <td className="font-weight-light" key={column}>
                            {this.props.tableBody[row][column]}
                        </td>
                    );
                }
            }
            if (this.props.enableSltDev) {
                insertTableBody.push(
                    <tr onClick={() => this.props.selectDev(this.props.tableBody[row][1])}
                        key={row} className={(this.props.selectedDevice === this.props.tableBody[row][1]) ? "selected-dev" : ""}
                    >
                        {td}
                    </tr>
                )
            } else {
                insertTableBody.push(<tr key={row}>{td}</tr>)
            }
        }

        let tableAlign = 'align-tc shadow rounded strctr';
        if (this.props.alignLeft) {
            tableAlign = 'align-tl shadow rounded strctr'
        }

        return (
            <div data-test="dataTable" className={tableAlign}>
                <ScrollBar component="div">
                    <div className="content">
                        <Table data-test="liveDataTable" className="mb-0">
                            <thead className="thead-light">
                                <tr className="w-100">
                                    {insertTableHead}
                                </tr>
                            </thead>
                            <tbody>
                                {insertTableBody}
                            </tbody>
                        </Table>
                    </div>
                </ScrollBar>
            </div>
        )
    }
}

export function mapStateToProps(state) {
    return ({
        selectedDevice: state.devices.selectedDevice
    });
}

export default connect(mapStateToProps)(LiveDataTable);
