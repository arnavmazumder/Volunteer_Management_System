import React, { Component, ChangeEvent } from "react";
import { isRecord } from "./record";
import { isValidTimes, isValidDate } from "./parse";
import { headers } from "./headers";



type ReqHoursProps = {
    onBackClick: () => void;
    onLogoutClick: () => void;
}

type ReqHoursState = {
    date: string,
    startTime: string,
    endTime: string,
    desc: string,
    err: string,
    names: {name:string, user_id: number, isChecked:boolean}[] | undefined
}

export class ReqGroup extends Component<ReqHoursProps, ReqHoursState> {
    constructor(props: ReqHoursProps) {
        super(props);
        this.state = {date: "", startTime: "", endTime:"", err:"", desc: "", names: undefined};
    }

    componentDidMount(): void {
        fetch("api/getNames", {
            credentials: 'include', method: "POST",
            headers: headers })
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
        } else if (resp.status===403) {
            this.props.onBackClick()
        } else {
            this.doGetError(`bad status code from /api/getNames: ${resp.status}`);
        }
    };


    doGetJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /api/getNames: not a record", data);
            return;
        }

        if (!Array.isArray(data.names)) {
            console.error("bad data from /api/getNames: data.names not an array", data);
            return;
        }

        const names: {name: string, user_id:number, isChecked:boolean}[] = [];
        for (const rec of data.names) {
            if (!isRecord(rec)) {
                console.error("bad data from /api/getNames: not a record", data);
                return;
            }

            if (typeof rec.name !== 'string') {
                console.error("bad data from /api/getNames: name not a string", data);
                return;
            }

            if (typeof rec.user_id !== 'number') {
                console.error("bad data from /api/getNames: user_id not a number", data);
                return;
            }
            
            names.push({name:rec.name, user_id: rec.user_id, isChecked:false})
        }

        this.setState({names: names})
    };

    
    doGetError = (msg: string): void => {
        this.setState({err: msg});
    };




    render = (): JSX.Element => {
        return (
            <div className='specific-style'>
                <div className="logcontainer2" id="logcontainer2">    
                    <div className="form-container login-container">
                        <form action="#">
                
                            <br/>
    
                            <h1>Request Group Hours</h1>
                            <div className="form-group"> 
                                <div className="form-group4">
                                    <label>Volunteer Date</label>             
                                    <input type="date" value={this.state.date} onChange={this.doDateChange}/>
                                </div>

                                <div className="form-group4">
                                    <label>Start Time</label>
                                    <input type="time" value={this.state.startTime} onChange={this.doStartTimeChange}/>
                                </div>

                                <div className="form-group4">
                                    <label>End Time</label>
                                    <input type="time" value={this.state.endTime} onChange={this.doEndTimeChange}/>
                                </div>

                            </div>


                            <label>Description:</label> 
                            <textarea cols={50} rows={3} value={this.state.desc} onChange={this.doDescChange}></textarea>

                            <p>Check all Attending Participants (including yourself):</p>
                            {this.renderNames()}
                            <div>
                                <button type="button" onClick={this.props.onBackClick}>Back</button>
                                <button type="button" onClick={this.doRequest}>Request</button>
                            </div>
                            {this.renderError()}
                        </form>
                    </div>
                </div>
            </div>
        )
    }


    renderNames = (): JSX.Element  => {
        if (this.state.names===undefined) {
            return <></>;
        }

        return (
            <div className="scrollable-container">
                <div className="form-group5">
                    {this.state.names.map((pair, index) => (
                        <div key={index} className="flex-container">
                            <input type='checkbox' checked={pair.isChecked} onChange={evt => this.doNamesChange(evt, index)} />
                            <span>{pair.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }


    doNamesChange = (_evt: ChangeEvent<HTMLInputElement>, index: number): void => {
        
        if (this.state.names!==undefined) {
            const names = this.state.names.map((pair, idx) => 
                idx === index ? { ...pair, isChecked: !pair.isChecked} : pair
            );
            this.setState({names: names})
        }
    }

    doDateChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({date: evt.target.value})
    }

    doStartTimeChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({startTime: evt.target.value})
    }


    doEndTimeChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({endTime: evt.target.value})
    }

    doDescChange = (evt: ChangeEvent<HTMLTextAreaElement>): void => {
        this.setState({desc: evt.target.value})
    }

    renderError = (): JSX.Element => {
        if (this.state.err.length === 0) {
            return <div></div>;
        } else {
            const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
                border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>Error</b>: {this.state.err}</span>
            </div>);
        }
    }


    doRequest = (): void => {

        if (this.state.date==="") {
            this.setState({err: "Please specify the volunteer date."})
        } else if (!isValidDate(this.state.date)) {
            this.setState({err: "Invalid date."})
        } else if (this.state.startTime==="") {
            this.setState({err: "Please specify the start time."})
        } else if (this.state.endTime==="") {
            this.setState({err: "Please specify the end time."})
        } else if (!isValidTimes(this.state.startTime, this.state.endTime, this.state.date)) {
            this.setState({err: "Invalid start and/or end times."})
        } else if (this.state.desc==="") {
            this.setState({err: "Please specify a description."})
        } else if (this.state.names===undefined) {
            this.setState({err: "Request Failed. Try again later."})
        } else {
            const requestedUsrIds: number[] = [];
            for (const rec of this.state.names) {
                if (rec.isChecked) {
                    requestedUsrIds.push(rec.user_id)
                }
            }

            const args = {
                desc: this.state.desc,
                date:this.state.date,
                startTime: this.state.startTime,
                endTime: this.state.endTime,
                userIds: requestedUsrIds
            }


            fetch("api/requestGroup", {
                credentials: 'include', method: "POST", body: JSON.stringify(args),
                headers: headers })
                .then(this.doReqResp)
                .catch(() => this.doReqError("failed to connect to server"));
        }
    }


    doReqResp = (resp: Response): void => {
        if (resp.status === 200) {
            resp.json().then(this.doReqJson)
            .catch(() => {this.doReqError("200 response is not JSON")});
        } else if (resp.status === 400) {
            resp.text().then(this.doReqError)
            .catch(() => this.doReqError("400 response is not text"));
        } else if (resp.status===401) {
            this.props.onLogoutClick();
        } else if (resp.status===403) {
            this.props.onBackClick()
        } else {
            this.doReqError(`bad status code from /api/requestGroup: ${resp.status}`);
        }
    };


    doReqJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /api/requestHours: not a record", data);
            return;
        }

        this.props.onBackClick();
    };

    
    doReqError = (msg: string): void => {
        this.setState({err: msg});
    };


}