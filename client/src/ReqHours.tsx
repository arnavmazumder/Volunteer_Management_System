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
}

export class ReqHours extends Component<ReqHoursProps, ReqHoursState> {
    constructor(props: ReqHoursProps) {
        super(props);
        this.state = {date: "", startTime: "", endTime:"", err:"", desc: ""};
    }



    render = (): JSX.Element => {
        return (
            <div className='specific-style'>
                <div className="logcontainer" id="logcontainer">    
                    <div className="form-container login-container">
                        <form action="#">
                            <br/>
   
                            <h1>Request Hours</h1>
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
                            <div>
                                <button type="button" onClick={this.props.onBackClick}>Back</button>
                                <button type="button" onClick={this.doRequest}>Request</button>
                            </div>
                            {this.renderError()}
                        </form>
                    </div>
                </div>
            </div>
        )}

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
                border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '2px' };
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
        } else {

            const args = {
                desc: this.state.desc,
                date:this.state.date,
                startTime: this.state.startTime,
                endTime: this.state.endTime
            }


            fetch("api/requestHours", {
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
        } else {
            this.doReqError(`bad status code from /api/requestHours: ${resp.status}`);
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