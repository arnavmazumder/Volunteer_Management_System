import React, { Component, ChangeEvent } from "react";
import { parseAdmin, parseUser } from "./parse";
import { isRecord } from "./record";
import { headers } from "./headers";
import { downloadCSV, convertToCSV } from "./download";



type AccountProps = {
    onLogoutClick: () => void;
    onReqHoursClick: () => void;
    onReqGroupClick: () => void;
    
}

type AccountState = {
    isLoading: boolean,
    isPending:  boolean,
    isDenied: boolean,
    name: string | undefined,
    ageGroup: string | undefined,
    role: string | undefined,
    logs: {date: string, hours: string, desc: string, log_id: number, reqStatus: string, startTime:string, endTime:string}[] | undefined,
    accountRequests: {user_id: number, email: string, name:string, dob:string, role:string, decision: string}[] | undefined,
    logRequests: {log_id: number, name: string, email: string, date: string, hours: string, desc: string, startTime:string, endTime:string, decision: string}[] | undefined

}

export class Account extends Component<AccountProps, AccountState> {
    constructor(props: AccountProps) {
        super(props);

        this.state = {
            isLoading: true, 
            isPending: false, 
            isDenied: false,
            name: undefined, 
            ageGroup: undefined, 
            role: undefined, 
            logs: undefined, 
            accountRequests: undefined, 
            logRequests: undefined
        }
    }

    componentDidMount(): void {
        this.doGetAccountInfo();
    }

    doGetAccountInfo = ():void => {
        fetch("api/getAccountInfo", {
            credentials: 'include', method: "POST", headers: headers })
            .then(this.doGetResp)
            .catch(() => this.doGetError("failed to connect to server"));
    }

    doGetResp = (resp: Response): void => {
        if (resp.status === 200) {
            resp.json().then(this.doGetJson)
            .catch(() => {this.doGetError("200 response is not JSON")});
        } else if (resp.status === 400) {
            resp.text().then(this.doGetError)
            .catch(() => this.doGetError("400 response is not text"));
        } else if (resp.status===401) {
            this.props.onLogoutClick();
        } else if (resp.status === 403) {
            this.setState({isLoading: false, isPending: true, isDenied:false})
        } else if (resp.status === 410) {
            this.setState({isLoading: false, isPending: false, isDenied: true})
        } else {
            this.doGetError(`bad status code from /api/getAccountInfo: ${resp.status}`);
        }
    };

    doGetJson = (data: unknown): void => {
        const parsedUserData = parseUser(data);
        const parsedAdminData = parseAdmin(data)
        if (parsedUserData!==undefined) {

            this.setState({
                isLoading: false,
                isPending: false,
                isDenied: false,
                name: parsedUserData.name,
                ageGroup: parsedUserData.ageGroup,
                role: parsedUserData.role,
                logs: parsedUserData.logs,
                accountRequests: undefined,
                logRequests: undefined
            })


        } else if (parsedAdminData !== undefined) {

            this.setState({
                isLoading: false,
                isPending: false,
                isDenied: false,
                name: parsedAdminData.name,
                ageGroup: undefined,
                role: parsedAdminData.role,
                logs: undefined,
                accountRequests: parsedAdminData.accountRequests,
                logRequests: parsedAdminData.logRequests
            })


        } else {
            this.doGetError("Invalid/bad data")
            this.props.onLogoutClick();
        }

    };
    
    doGetError = (msg: string): void => {
        console.error(msg)
    };

    render = (): JSX.Element => {
        if (this.state.isLoading) {
            return <div></div>;
        } else {
            if (this.state.isPending) {
                return (
                    <div className="specific-style">
                        <h4>Your account is pending approval. Please log in at a later time.</h4>
                        <button type='button' onClick={this.props.onLogoutClick}>Logout</button>
                    </div>
                );
            } else if (this.state.isDenied) {
                return (
                    <div className="specific-style">
                        <h4>Your account request has been denied. This account will be deleted within 24 hours.</h4>
                        <button type='button' onClick={this.props.onLogoutClick}>Logout</button>
                    </div>
                );
            } else {
                if (this.state.role==='Admin') {
                    return (
                    <div className="specific-style2">
                        <style scoped></style>
                        <h1>{this.state.name} (Admin)</h1>
                        <p><b><u>Log Requests:</u></b></p>
                        <br/>
                        {this.renderLogReqTable()}
                        <br/>
                        <div><button type="button" onClick={this.doLogRequestUpdate}> Update Log Requests</button></div>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <br/>
                        <p><b><u>Account Requests:</u></b></p>
                        <br/>
                        {this.renderAccReqTable()}
                        <br/>
                        <div><button type="button" onClick={this.doAccRequestUpdate}> Update Account Requests</button></div>
                        <br/>
                        <br/>
                        <br/>
                        <div>
                            <button type='button' onClick={this.props.onLogoutClick}>Logout</button>
                            <button type='button' onClick={this.doExportClick}>Export</button>
                        </div>
                        <br/>
                        <br/>
                        <br/>
                    </div>)
                } else {
                    

                    return (
                        <div className="specific-style2">
                            <h1>{this.state.name}</h1>
                            <p><u><b>Age Group:</b></u> {this.state.ageGroup}</p>
                            <p><u><b>Role:</b></u>  {this.state.role}</p>
                            <br/>

                            <p><b><u>Hour Log</u></b></p>
                            <br/>
                            <br/>
                            {this.renderUserTable()}
                            <br/>
                            <br/>
                            <div>
                                <button type="button" onClick={this.doReqHoursclick}>Request Hours</button>
                                {this.renderReqGroup()}
                                <br/>
                                <br/>
                                <button type='button' onClick={this.props.onLogoutClick}>Logout</button>
                            </div>
                        </div>
                    );
                }
            }
        }
        
    }

    doReqHoursclick = (): void => {
        this.props.onReqHoursClick()
        this.doGetAccountInfo()
    }


    renderReqGroup = (): JSX.Element => {
        if (this.state.role==='Officer') {
            return <button type='button' onClick={this.doReqGroupclick}>Request Group Hours</button>;
        } else {
            return <></>
        }
    }

    doReqGroupclick = (): void => {
        this.props.onReqGroupClick()
        this.doGetAccountInfo()
    }


    renderUserTable = (): JSX.Element => {
        if (this.state.logs===undefined) {
            return <div></div>
        } else {
            
            const headerRowStyle = {
                backgroundColor: '#f2f2f2',
            };
            const filtered = this.state.logs.filter( (val) => val.reqStatus==='Approved')
            const sum = filtered.reduce((acc, log) => acc + Number(log.hours), 0).toFixed(2);
            
            return (<div>
                <table style={{width: '98%', borderCollapse: 'collapse', marginLeft: '20px'}}>
                <thead>
                    <tr style={headerRowStyle}>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Status</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Date</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Start Time</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>End Time</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Hours</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '200px'}}>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.logs.map((log) => (
                    <tr key={log.log_id}>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}> {log.reqStatus}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.date}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.startTime}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.endTime}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.hours}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '200px'}}>{log.desc}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
                <br/>
                <br/>
                <p><b>TOTAL APPROVED HOURS: {sum}</b></p>
            </div>)
        }
    }


    renderLogReqTable = (): JSX.Element => {
        if (this.state.logRequests===undefined) {
            return <div></div>
        } else {
            
            const headerRowStyle = {
                backgroundColor: '#f2f2f2',
            };

            
            return (<div>
                <table style={{width: '98%', borderCollapse: 'collapse', marginLeft: '20px'}}>
                <thead>
                    <tr style={headerRowStyle}>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Name</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Email</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Date</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Start Time</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>End Time</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Hours</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '300px'}}>Description</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '5px'}}>Select Status</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.logRequests.map((log, idx) => (
                    <tr key={log.log_id}>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.name}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.email}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.date}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.startTime}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.endTime}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{log.hours}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '300px'}}>{log.desc}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '5px'}}>
                           <select value={log.decision} onChange={ (evt) => this.doLogStatusChange(evt, idx)}>
                                <option></option>
                                <option>Approved</option>
                                <option>Denied</option>
                            </select>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>)
        }
    }

    doExportClick = (): void => {
        fetch("api/exportData", {
            credentials: 'include', method: "POST", headers: headers })
            .then(this.doExportResp)
            .catch(() => this.doExportError("failed to connect to server"));
    }

    doExportResp = (resp: Response): void => {
        if (resp.status === 200) {
            resp.json().then(this.doExportJson)
            .catch(() => {this.doUpdateLogError("200 response is not JSON")});
        } else if (resp.status === 400) {
            resp.text().then(this.doExportError)
            .catch(() => this.doExportError("400 response is not text"));
        } else if (resp.status===401) {
            this.props.onLogoutClick();
        } else if (resp.status === 403) {
            this.doExportError("Unauthorized action")
        } else {
            this.doExportError(`bad status code from /api/exportData: ${resp.status}`);
        }
    }


    doExportJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /api/exportData: not a record", data);
            return;
        }

        if (!Array.isArray(data.data)) {
            console.error("bad data from /api/exportData: does not contain array", data);
            return;
        }

        for (const rec of data.data) {
            if (!isRecord(rec)) {
                console.error("bad data from /api/exportData: elements not a record", data);
                return;
            }
        }

        const csvData = convertToCSV(data.data);
        downloadCSV(csvData, "surdaan_2024_pvsa_logs.csv")
    }



    doExportError = (msg: string): void => {
        console.error(msg);
    }





    doLogStatusChange = (evt: ChangeEvent<HTMLSelectElement>, idx: number): void => {
        if (this.state.logRequests!==undefined) {
            const logReqs = this.state.logRequests.map((req, i) => 
                i === idx ? { ...req, decision: evt.target.value} : req
            );
            this.setState({logRequests: logReqs})
        }
    }

    doLogRequestUpdate = ():void => {
        if (this.state.logRequests!==undefined) {
            const validReqs = this.state.logRequests.filter((req) => req.decision!=="");
            const pairs = [];
            for (const req of validReqs) {
                pairs.push({log_id: req.log_id, decision: req.decision})
            }

            fetch("api/updateLogs", {
                credentials: 'include', method: "POST", body: JSON.stringify({pairs: pairs}), headers: headers })
                .then(this.doUpdateLogResp)
                .catch(() => this.doUpdateLogError("failed to connect to server"));
        }
    }


    doUpdateLogResp = (resp: Response): void => {
        if (resp.status === 200) {
            resp.json().then(this.doUpdateLogJson)
            .catch(() => {this.doUpdateLogError("200 response is not JSON")});
        } else if (resp.status === 400) {
            resp.text().then(this.doUpdateLogError)
            .catch(() => this.doUpdateLogError("400 response is not text"));
        } else if (resp.status===401) {
            this.props.onLogoutClick();
        } else if (resp.status === 403) {
            this.doUpdateLogError("Unauthorized action")
        } else {
            this.doUpdateLogError(`bad status code from /api/updateLogs: ${resp.status}`);
        }
    }

    doUpdateLogJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /api/requestHours: not a record", data);
            return;
        }

        this.doGetAccountInfo();
    }


    doUpdateLogError = (msg: string): void => {
        console.error(msg);
    }





    renderAccReqTable = (): JSX.Element => {
        if (this.state.accountRequests===undefined) {
            return <div></div>
        } else {
            
            const headerRowStyle = {
                backgroundColor: '#f2f2f2',
            };

            
            return (<div>
                <table style={{width: '98%', borderCollapse: 'collapse', marginLeft: '20px'}}>
                <thead>
                    <tr style={headerRowStyle}>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Name</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Email</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Date of Birth</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>Role</th>
                    <th style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '5px'}}>Select Status</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.accountRequests.map((account, idx) => (
                    <tr key={account.user_id}>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{account.name}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{account.email}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{account.dob}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '30px'}}>{account.role}</td>
                        <td style={{border: '1px solid #dddddd',textAlign: 'left',padding: '8px', width: '5px'}}>
                           <select value={account.decision} onChange={ (evt) => this.doAccStatusChange(evt, idx)}>
                                <option></option>
                                <option>Approved</option>
                                <option>Denied</option>
                            </select>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>)
        }
    }


    doAccStatusChange = (evt: ChangeEvent<HTMLSelectElement>, idx: number): void => {
        if (this.state.accountRequests!==undefined) {
            const accReqs = this.state.accountRequests.map((req, i) => 
                i === idx ? { ...req, decision: evt.target.value} : req
            );
            this.setState({accountRequests: accReqs})
        }
    }


    doAccRequestUpdate = ():void => {
        if (this.state.accountRequests!==undefined) {
            const validReqs = this.state.accountRequests.filter((req) => req.decision!=="");
            const pairs = [];
            for (const req of validReqs) {
                pairs.push({user_id: req.user_id, decision: req.decision})
            }

            fetch("api/updateAccounts", {
                credentials: 'include', method: "POST", body: JSON.stringify({pairs: pairs}), headers: headers })
                .then(this.doUpdateAccResp)
                .catch(() => this.doUpdateAccError("failed to connect to server"));
        }
    }


    doUpdateAccResp = (resp: Response): void => {
        if (resp.status === 200) {
            resp.json().then(this.doUpdateAccJson)
            .catch(() => {this.doUpdateAccError("200 response is not JSON")});
        } else if (resp.status === 400) {
            resp.text().then(this.doUpdateAccError)
            .catch(() => this.doUpdateAccError("400 response is not text"));
        } else if (resp.status===401) {
            this.props.onLogoutClick();
        } else if (resp.status === 403) {
            this.doUpdateAccError("Unauthorized action")
        } else {
            this.doUpdateAccError(`bad status code from /api/updateAccounts: ${resp.status}`);
        }
    }

    doUpdateAccJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /api/requestHours: not a record", data);
            return;
        }

        this.doGetAccountInfo();
    }


    doUpdateAccError = (msg: string): void => {
        console.error(msg);
    }


}