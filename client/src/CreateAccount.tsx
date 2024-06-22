import React, { Component, ChangeEvent } from "react";
import { isRecord } from "./record";
import { headers } from "./headers";

type CreateAccountProps = {
    onBackClick: () => void;
    onCreateAccountClick: () => void;
}

type CreateAccountState = {
    email: string
    password: string
    showingPass: boolean
    name: string
    dob: string
    err: string
    role: string
}

export class CreateAcount extends Component<CreateAccountProps, CreateAccountState> {

    constructor(props: CreateAccountProps) {
        super(props);
        


        this.state = {email: "", password: "", showingPass: false, name: "", dob: "", err: "", role: ""};
    }

    render = (): JSX.Element => {
        return (
            <div className="specific-style">
                <div className="container" id="accontainer">    
                    <div className="form-container login-container">
                        <form action="#">
                            <h1>Create Account</h1>
                            
                            <input type='text' placeholder='Full Name' size={30} value={this.state.name} onChange={this.doNameChange}></input>
                            <input type='text' placeholder='Email' size={40} value={this.state.email} onChange={this.doEmailChange}></input>
                            <div className="password-container">
                                <input 
                                    placeholder="Password" 
                                    type={this.state.showingPass ? "text" : "password"} 
                                    size={40} 
                                    value={this.state.password} 
                                    onChange={this.doPasswordChange} 
                                />
                                <span className="password-toggle-icon" onClick={this.doTogglePasswordClick}>
                                    <i className={this.state.showingPass ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                </span>
                            </div>

                            <div className="form-group4">
                                <label>Birthdate</label>
                                <input type="date" placeholder='Birthdate' value={this.state.dob} onChange={this.doDobChange}/>
                            </div>

                            <div className="form-group2">
                                <label>Role</label>
                                    <select value={this.state.role} onChange={this.doRoleChange}>
                                    <option value=""></option>
                                    <option value="Volunteer">Volunteer</option>
                                    <option value="Officer">Officer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="form-group3">
                                <button type="button" onClick={this.doBackClick}>Back</button>
                                <button type="button" onClick={this.doCreateAccountClick}>Create</button>
                            </div>
                            {this.renderError()}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    doRoleChange = (evt: ChangeEvent<HTMLSelectElement>): void => {
      this.setState({role: evt.target.value})  
    }

    doEmailChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({email: evt.target.value});
    }

    doPasswordChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({password: evt.target.value});
    }

    doTogglePasswordClick = (): void => {
        if (this.state.showingPass) {
            this.setState({showingPass: false});
        } else {
            this.setState({showingPass: true});
        }
    }

    doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({name: evt.target.value});
    }

    doDobChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({dob: evt.target.value});
    }

    doBackClick = (): void => {
        this.props.onBackClick();
    }

    doCreateAccountClick = (): void => {
        const emailReg: RegExp = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}/;
        const dob = new Date(this.state.dob);
        dob.setDate(dob.getDate() + 1);
        const today = new Date();
        const tempAge = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();

        const age = (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? tempAge - 1 : tempAge;

        if (this.state.name==="") {
            this.setState({err: "Please enter your full name."})
        } else if (this.state.email==="") {
            this.setState({err: "Please enter your email."})
        } else if (!emailReg.test(this.state.email)) {
            this.setState({err: "Invalid email."})
        } else if (this.state.password==="") {
            this.setState({err: "Please enter you password."})
        } else if (this.state.password.includes(" ")) {
            this.setState({err: "Password cannot include a space."})
        } else if (this.state.password.length < 8) {
            this.setState({err: "Your password must be at least 8 characters."})
        } else if (this.state.dob==="") {
            this.setState({err: "Please enter your date of birth."})
        } else if (age < 5) {
            this.setState({err: "Ineligible age."})
        }else if (this.state.role==="") {
            this.setState({err: "Please select a role."})
        } else {

            const args = {
                name: this.state.name, 
                email: this.state.email, 
                password: this.state.password,
                dob: this.state.dob,
                role: this.state.role
            }
    
            fetch("/api/create", {
                method: "POST", body: JSON.stringify(args),
                headers: headers })
                .then(this.doAddResp)
                .catch(() => this.doAddError("failed to connect to server"));
    
        }

    }


    doAddResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doAddJson)
              .catch(() => this.doAddError("200 response is not JSON"));
        } else if (resp.status === 400) {
          resp.text().then(this.doAddError)
              .catch(() => this.doAddError("400 response is not text"));
        } else {
          this.doAddError(`bad status code from /api/create: ${resp.status}`);
        }
    };

    doAddJson = (data: unknown): void => {
        if (!isRecord(data)) {
          console.error("bad data from /api/create: not a record", data);
          return;
        }

        this.props.onCreateAccountClick();
    };
    
    doAddError = (msg: string): void => {
        this.setState({err: msg})
    };


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
    };


} 