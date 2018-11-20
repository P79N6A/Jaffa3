import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import { saveAs } from 'file-saver/FileSaver';
import escapeRegExp from 'lodash/escapeRegExp';
import endsWith from 'lodash/endsWith';

import { formatTime } from '../../helpers/helpers';
import { getTrackerData } from '../../helpers/trackers/trackers';
import PageTitle from '../ui/PageTitle';
import Card from '../ui/Card';
import Loading from '../ui/Loading';
import PopoverFiltered from '../ui/PopoverFilter';
import Popover from '../ui/Popover';
import './Logs.css';

const DOWNLOAD_LOG_FILENAME = 'dns-logs.txt';

class Logs extends Component {
    componentDidMount() {
        this.getLogs();
        this.props.getFilteringStatus();
    }

    componentDidUpdate(prevProps) {
        // get logs when queryLog becomes enabled
        if (this.props.dashboard.queryLogEnabled && !prevProps.dashboard.queryLogEnabled) {
            this.props.getLogs();
        }
    }

    getLogs = () => {
        // get logs on initialization if queryLogIsEnabled
        if (this.props.dashboard.queryLogEnabled) {
            this.props.getLogs();
        }
    }

    renderTooltip(isFiltered, rule, filter) {
        if (rule) {
            return (isFiltered && <PopoverFiltered rule={rule} filter={filter}/>);
        }
        return '';
    }

    toggleBlocking = (type, domain) => {
        const { userRules } = this.props.filtering;
        const lineEnding = !endsWith(userRules, '\n') ? '\n' : '';
        const baseRule = `||${domain}^$important`;
        const baseUnblocking = `@@${baseRule}`;
        const blockingRule = type === 'block' ? baseUnblocking : baseRule;
        const unblockingRule = type === 'block' ? baseRule : baseUnblocking;
        const preparedBlockingRule = new RegExp(`(^|\n)${escapeRegExp(blockingRule)}($|\n)`);
        const preparedUnblockingRule = new RegExp(`(^|\n)${escapeRegExp(unblockingRule)}($|\n)`);

        if (userRules.match(preparedBlockingRule)) {
            this.props.setRules(userRules.replace(`${blockingRule}`, ''));
            this.props.addSuccessToast(`Rule removed from the custom filtering rules: ${blockingRule}`);
        } else if (!userRules.match(preparedUnblockingRule)) {
            this.props.setRules(`${userRules}${lineEnding}${unblockingRule}\n`);
            this.props.addSuccessToast(`Rule added to the custom filtering rules: ${unblockingRule}`);
        }

        this.props.getFilteringStatus();
    }

    renderBlockingButton(isFiltered, domain) {
        const buttonClass = isFiltered ? 'btn-outline-secondary' : 'btn-outline-danger';
        const buttonText = isFiltered ? 'Unblock' : 'Block';

        return (
            <div className="logs__action">
                <button
                    type="button"
                    className={`btn btn-sm ${buttonClass}`}
                    onClick={() => this.toggleBlocking(buttonText.toLowerCase(), domain)}
                >
                    {buttonText}
                </button>
            </div>
        );
    }

    renderLogs(logs) {
        const columns = [{
            Header: 'Time',
            accessor: 'time',
            maxWidth: 110,
            filterable: false,
            Cell: ({ value }) => (<div className="logs__row"><span className="logs__text" title={value}>{formatTime(value)}</span></div>),
        }, {
            Header: 'Domain name',
            accessor: 'domain',
            Cell: (row) => {
                const response = row.value;
                const trackerData = getTrackerData(response);

                return (
                    <div className="logs__row" title={response}>
                        <div className="logs__text">
                            {response}
                        </div>
                        {trackerData && <Popover data={trackerData}/>}
                    </div>
                );
            },
        }, {
            Header: 'Type',
            accessor: 'type',
            maxWidth: 60,
        }, {
            Header: 'Response',
            accessor: 'response',
            Cell: (row) => {
                const responses = row.value;
                const { reason } = row.original;
                const isFiltered = row ? reason.indexOf('Filtered') === 0 : false;
                const parsedFilteredReason = reason.replace('Filtered', 'Filtered by ');
                const rule = row && row.original && row.original.rule;
                const { filterId } = row.original;
                const { filters } = this.props.filtering;
                let filterName = '';

                if (reason === 'FilteredBlackList' || reason === 'NotFilteredWhiteList') {
                    if (filterId === 0) {
                        filterName = 'Custom filtering rules';
                    } else {
                        const filterItem = Object.keys(filters)
                            .filter(key => filters[key].id === filterId);
                        filterName = filters[filterItem].name;
                    }
                }

                if (isFiltered) {
                    return (
                        <div className="logs__row">
                            <span className="logs__text" title={parsedFilteredReason}>
                                {parsedFilteredReason}
                            </span>
                            {this.renderTooltip(isFiltered, rule, filterName)}
                        </div>
                    );
                }

                if (responses.length > 0) {
                    const liNodes = responses.map((response, index) =>
                        (<li key={index} title={response}>{response}</li>));
                    const isRenderTooltip = reason === 'NotFilteredWhiteList';

                    return (
                        <div className="logs__row">
                            <ul className="list-unstyled">{liNodes}</ul>
                            {this.renderTooltip(isRenderTooltip, rule, filterName)}
                        </div>
                    );
                }
                return (
                    <div className="logs__row">
                        <span>Empty</span>
                        {this.renderTooltip(isFiltered, rule, filterName)}
                    </div>
                );
            },
            filterMethod: (filter, row) => {
                if (filter.value === 'filtered') {
                    // eslint-disable-next-line no-underscore-dangle
                    return row._original.reason.indexOf('Filtered') === 0;
                }
                return true;
            },
            Filter: ({ filter, onChange }) =>
                <select
                    onChange={event => onChange(event.target.value)}
                    className="form-control"
                    value={filter ? filter.value : 'all'}
                >
                    <option value="all">Show all</option>
                    <option value="filtered">Show filtered</option>
                </select>,
        }, {
            Header: 'Client',
            accessor: 'client',
            maxWidth: 250,
            Cell: (row) => {
                const { reason } = row.original;
                const isFiltered = row ? reason.indexOf('Filtered') === 0 : false;

                return (
                    <Fragment>
                        <div className="logs__row">
                            {row.value}
                        </div>
                        {this.renderBlockingButton(isFiltered, row.original.domain)}
                    </Fragment>
                );
            },
        },
        ];

        if (logs) {
            return (<ReactTable
                className='logs__table'
                filterable
                data={logs}
                columns={columns}
                showPagination={true}
                defaultPageSize={50}
                minRows={7}
                noDataText="No logs found"
                defaultFilterMethod={(filter, row) => {
                    const id = filter.pivotId || filter.id;
                    return row[id] !== undefined ?
                        String(row[id]).indexOf(filter.value) !== -1 : true;
                }}
                defaultSorted={[
                    {
                        id: 'time',
                        desc: true,
                    },
                ]}
                getTrProps={(_state, rowInfo) => {
                    // highlight filtered requests
                    if (!rowInfo) {
                        return {};
                    }

                    if (rowInfo.original.reason.indexOf('Filtered') === 0) {
                        return {
                            className: 'red',
                        };
                    } else if (rowInfo.original.reason === 'NotFilteredWhiteList') {
                        return {
                            className: 'green',
                        };
                    }

                    return {
                        className: '',
                    };
                }}
                />);
        }
        return undefined;
    }

    handleDownloadButton = async (e) => {
        e.preventDefault();
        const data = await this.props.downloadQueryLog();
        const jsonStr = JSON.stringify(data);
        const dataBlob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' });
        saveAs(dataBlob, DOWNLOAD_LOG_FILENAME);
    };

    renderButtons(queryLogEnabled) {
        if (queryLogEnabled) {
            return (
                <Fragment>
                    <button
                        className="btn btn-gray btn-sm mr-2"
                        type="submit"
                        onClick={() => this.props.toggleLogStatus(queryLogEnabled)}
                    >Disable log</button>
                    <button
                        className="btn btn-primary btn-sm mr-2"
                        type="submit"
                        onClick={this.handleDownloadButton}
                    >Download log file</button>
                    <button
                        className="btn btn-outline-primary btn-sm"
                        type="submit"
                        onClick={this.getLogs}
                    >Refresh</button>
                </Fragment>
            );
        }

        return (
            <button
                className="btn btn-success btn-sm mr-2"
                type="submit"
                onClick={() => this.props.toggleLogStatus(queryLogEnabled)}
            >Enable log</button>
        );
    }

    render() {
        const { queryLogs, dashboard } = this.props;
        const { queryLogEnabled } = dashboard;
        return (
            <Fragment>
                <PageTitle title="Query Log" subtitle="Last 5000 DNS queries">
                    <div className="page-title__actions">
                        {this.renderButtons(queryLogEnabled)}
                    </div>
                </PageTitle>
                <Card>
                    {queryLogEnabled && queryLogs.getLogsProcessing && <Loading />}
                    {queryLogEnabled && !queryLogs.getLogsProcessing &&
                        this.renderLogs(queryLogs.logs)}
                </Card>
            </Fragment>
        );
    }
}

Logs.propTypes = {
    getLogs: PropTypes.func,
    queryLogs: PropTypes.object,
    dashboard: PropTypes.object,
    toggleLogStatus: PropTypes.func,
    downloadQueryLog: PropTypes.func,
    getFilteringStatus: PropTypes.func,
    filtering: PropTypes.object,
    userRules: PropTypes.string,
    setRules: PropTypes.func,
    addSuccessToast: PropTypes.func,
};

export default Logs;
