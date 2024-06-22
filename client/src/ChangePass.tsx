import React, { Component, ChangeEvent } from "react";
import { headers } from "./headers";

type ChangePassProps = {
    onBackClick: (passwordJustChanged: boolean) => void;
}


type ChangePassState = {
    password1: string;
    password2: string;
    showingPass1: boolean;
    showingPass2: boolean;
    isAuth: boolean;
    err: string;
}


export class ChangePass extends Component<ChangePassProps, ChangePassState> {
    constructor(props: ChangePassProps) {
        super(props);

        this.state = {password1: "", password2:"", err: "", showingPass1: false, showingPass2: false, isAuth: false};
    }

    componentDidMount(): void {
        const queryParams = new URLSearchParams(location.search);
        fetch("/api/authChangePass?key=" + queryParams.get("key"), {
            method: "POST",
            headers: headers })
            .then(this.doAuthChangePassResp)
            .catch(() => this.doChangePassError("failed to connect to server"));
    }

    doAuthChangePassResp = (resp: Response):void => {
        if (resp.status === 200) {
            resp.json().then(this.doAuthChangePassJson)
                .catch(() => {this.doAuthChangePassError("200 response is not JSON")
          });
          } else if (resp.status === 400) {
            resp.text().then(this.doChangePassError)
                .catch(() => this.doAuthChangePassError("400 response is not text"));
          } else if (resp.status===401) {
              this.props.onBackClick(false);
          } else {
            this.doAuthChangePassError(`bad status code from /api/authChangePass: ${resp.status}`);
          }
    }

    doAuthChangePassJson = (_data: unknown): void => {
        this.setState({isAuth: true})
    }

    doAuthChangePassError = (msg:string): void => {
        console.error(msg)
    }


    render = (): JSX.Element => {
        if (!this.state.isAuth) {
            return (<div></div>);
        } else {
            return (
                <div className='specific-style'>
                    <div className="container" id="container">    
                        <div className="form-container login-container">
                            <form action="#">
                                <h1>Change Password</h1>

                                <div className="password-container">
                                    <input 
                                        placeholder="New Password" 
                                        type={this.state.showingPass1 ? "text" : "password"} 
                                        size={40} 
                                        value={this.state.password1} 
                                        onChange={this.doPass1Change} 
                                    />
                                    <span className="password-toggle-icon" onClick={this.doTogglePass1Click}>
                                        <i className={this.state.showingPass1 ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                    </span>
                                </div>

                                <div className="password-container">
                                    <input 
                                        placeholder="New Password" 
                                        type={this.state.showingPass2 ? "text" : "password"} 
                                        size={40} 
                                        value={this.state.password2} 
                                        onChange={this.doPass2Change} 
                                    />
                                    <span className="password-toggle-icon" onClick={this.doTogglePass2Click}>
                                        <i className={this.state.showingPass2 ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                                    </span>
                                </div>

                                <button type="button" onClick={this.doChangePassClick}>Change Password</button>
                                {this.renderError()}
                            </form>
                        </div>
                    </div>
                </div>
                
            );
        }
    }


    doPass1Change = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({password1: evt.target.value});
    }

    doPass2Change = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({password2: evt.target.value});
    }


    doChangePassClick = (): void => {
        
        if (this.state.password1==="" || this.state.password2==="") {
            this.setState({err: "Please enter new password twice."})
        } else if (this.state.password1!==this.state.password2) {
            this.setState({err: "Passwords must match."})
        } else if (this.state.password1.includes(" ")) {
            this.setState({err: "Password cannot include a space."})
        } else if (this.state.password1.length < 8) {
            this.setState({err: "Your password must be at least 8 characters."})
        } else {

            const args = {
                password1: this.state.password1,
                password2: this.state.password2
            }

            const queryParams = new URLSearchParams(location.search);
            fetch("/api/changePass?key=" + queryParams.get("key"), {
                method: "POST", body: JSON.stringify(args),
                headers: headers })
                .then(this.doChangePassResp)
                .catch(() => this.doChangePassError("failed to connect to server"));
        }
    }


    doChangePassResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doChangePassJson)
              .catch(() => {this.doChangePassError("200 response is not JSON")
        });
        } else if (resp.status === 400) {
          resp.text().then(this.doChangePassError)
              .catch(() => this.doChangePassError("400 response is not text"));
        } else if (resp.status===401) {
            this.props.onBackClick(false);
        } else {
          this.doChangePassError(`bad status code from /api/changePass: ${resp.status}`);
        }
    };

    doChangePassJson = (_data: unknown): void => {
        this.props.onBackClick(true);
    };
    
    doChangePassError = (msg: string): void => {
        this.setState({err: msg})
    };




    doTogglePass1Click = (): void => {
        if (this.state.showingPass1) {
            this.setState({showingPass1: false});
        } else {
            this.setState({showingPass1: true});
        }
    }

    doTogglePass2Click = (): void => {
        if (this.state.showingPass2) {
            this.setState({showingPass2: false});
        } else {
            this.setState({showingPass2: true});
        }
    }




    renderError = (): JSX.Element => {

        if (this.state.err.length !== 0) {
            const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
                border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>Error</b>: {this.state.err}</span>
            </div>);
        } else {
            return (<div></div>);
        }
    };


}