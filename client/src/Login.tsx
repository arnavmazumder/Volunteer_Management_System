import React, { Component, ChangeEvent } from "react";
import { headers } from "./headers";

type LoginProps = {
    onCreateAccountClick: () => void;
    onLoginClick: () => void;
    accountJustCreated: boolean;
    passwordJustChanged: boolean;
}


type LoginState = {
    email: string;
    password: string;
    showingPass: boolean;
    err: string;
}

export class Login extends Component<LoginProps, LoginState> {
    constructor(props: LoginProps) {
        super(props);

        this.state = {email: "", password:"", err: "", showingPass: false};
    }


    render = (): JSX.Element => {
        return (
            <div className='specific-style'>
                <div className="container" id="container">    
                    <div className="form-container login-container">
                        <form action="#">
                            <h1>Surdaan Volunteers</h1>
                            <input type="text" placeholder="Email" size={30} value={this.state.email} onChange={this.doEmailChange} />

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

                            <button type="button" onClick={this.doLoginClick}>Login</button>
                            <a onClick={this.doForgotPassClick}><u>Forgot Password</u></a>
                            <span>If you don't have an account yet, create one here</span>
                            <button type="button" onClick={this.doCreateAccountClick}>Create Account</button>
                            {this.renderError()}
                        </form>
                    </div>
                </div>
            </div>
            
        );
    }

    doForgotPassClick = (): void => {
        const emailReg: RegExp = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}/;

        if (this.state.email==="") {
            this.setState({err: "Please enter your email."})
        } else if (!emailReg.test(this.state.email)) {
            this.setState({err: "Invalid email."})
        } else {
            this.setState({err: "Sending Email..."})
            const args = {email: this.state.email}

            fetch('/api/forgotPassEmail', 
                {
                    method: "POST", 
                    body: JSON.stringify(args), 
                    headers: headers
                })
            .then(this.doForgotPassResp)
            .catch(() => this.doForgotPassError("failed to connect to server"));
        }
    }


    doForgotPassResp = (resp: Response) => {
        if (resp.status === 200) {
            resp.json().then(this.doForgotPassJson)
                .catch(() => {this.doLoginError("200 response is not JSON")
          });
          } else if (resp.status === 400) {
            resp.text().then(this.doForgotPassError)
                .catch(() => this.doForgotPassError("400 response is not text"));
          } else if (resp.status===401) {
              this.setState({err: "Email does not match an account."})
          } else {
            this.doForgotPassError(`bad status code from /api/forgotPassEmail: ${resp.status}`);
          }
    }


    doForgotPassJson = (_data: unknown) => {
        this.setState({err: "Password change email sent."})
    }



    doForgotPassError = (msg: string) => {
        this.setState({err: msg})
    }

    doEmailChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({email: evt.target.value});
    }

    doPasswordChange = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({password: evt.target.value});
    }

    doCreateAccountClick = (): void => {
        this.props.onCreateAccountClick();

    }


    doLoginClick = (): void => {

        const emailReg: RegExp = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}/;

        if (this.state.email==="") {
            this.setState({err: "Please enter your email."})
        } else if (!emailReg.test(this.state.email)) {
            this.setState({err: "Invalid email."})
        } else if (this.state.password==="") {
            this.setState({err: "Please enter you password."})
        } else {

            const args = {
                email: this.state.email,
                password: this.state.password
            }

            fetch("/api/login", {
                method: "POST", body: JSON.stringify(args),
                headers: headers })
                .then(this.doLoginResp)
                .catch(() => this.doLoginError("failed to connect to server"));
                                
        }
    }


    doLoginResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doLoginJson)
              .catch(() => {this.doLoginError("200 response is not JSON")
        });
        } else if (resp.status === 400) {
          resp.text().then(this.doLoginError)
              .catch(() => this.doLoginError("400 response is not text"));
        } else if (resp.status===401) {
            this.setState({err: "Incorrect Password or Email."})
        } else {
          this.doLoginError(`bad status code from /api/login: ${resp.status}`);
        }
    };

    doLoginJson = (_data: unknown): void => {
        this.props.onLoginClick();
    };
    
    doLoginError = (msg: string): void => {
        this.setState({err: msg})
    };




    doTogglePasswordClick = (): void => {
        if (this.state.showingPass) {
            this.setState({showingPass: false});
        } else {
            this.setState({showingPass: true});
        }
    }




    renderError = (): JSX.Element => {
        
        if (this.state.err === "Sending Email...") {
            const style = {width: '300px', backgroundColor: 'rgb(255,255,0)',
                border: '1px solid rgb(61,137,66)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>{this.state.err}</b></span>
            </div>);
        }

        if (this.state.err === "Password change email sent.") {
            const style = {width: '300px', backgroundColor: 'rgb(192,246,194)',
                border: '1px solid rgb(61,137,66)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>{this.state.err}</b></span>
            </div>);
        }

        if (this.state.err.length !== 0) {
            const style = {width: '300px', backgroundColor: 'rgb(246,194,192)',
                border: '1px solid rgb(137,66,61)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>Error</b>: {this.state.err}</span>
            </div>);
        } else if (this.props.accountJustCreated) {
            const style = {width: '300px', backgroundColor: 'rgb(192,246,194)',
                border: '1px solid rgb(61,137,66)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>Account Created</b></span>
            </div>);
        } else if (this.props.passwordJustChanged) {
            const style = {width: '300px', backgroundColor: 'rgb(192,246,194)',
                border: '1px solid rgb(61,137,66)', borderRadius: '5px', padding: '5px' };
            return (<div style={{marginTop: '15px'}}>
                <span style={style}><b>Successfully Changed Password</b></span>
            </div>);
        } else {
            return (<div></div>);
        }
    };


}