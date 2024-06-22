import React, { Component } from "react";
import { Login } from "./Login";
import { CreateAcount } from "./CreateAccount";
import { Account } from "./Account";
import { ReqHours } from "./ReqHours";
import { ReqGroup } from "./ReqGroup";
import { ChangePass } from "./ChangePass";
import { NavigateFunction, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { headers } from "./headers";


type VolunteerAppProps = {
  navigate: NavigateFunction;
}

type VolunteerAppState = {
  accountJustCreated: boolean,
  passwordJustChanged: boolean,
  isAuthenticated: boolean,
  isLoading: boolean,
  isGroupReq: boolean
}

/** Displays the UI of the Volunteer Log application. */
export class VolunteerApp extends Component<VolunteerAppProps, VolunteerAppState> {

  constructor(props: VolunteerAppProps) {
    super(props);

    this.state = {accountJustCreated: false, passwordJustChanged: false, isAuthenticated: false, isLoading: true, isGroupReq: false}
  }

  componentDidMount(): void {
    this.doCheckAuthentication();
  }

  doCheckAuthentication = (): void => {
    fetch("api/authenticate", {
      credentials: 'include', method: "POST", headers: headers })
      .then(this.doAuthResp)
      .catch(() => this.doAuthError("failed to connect to server"));

  }

  doAuthResp = (resp: Response): void => {
    this.setState({isAuthenticated: resp.ok, isLoading: false});
  };

  doAuthError = (msg: string): void => {
      console.error(msg)
      this.setState({ isAuthenticated: false, isLoading: false });
  };

  
  render = (): JSX.Element => {
    if (this.state.isLoading) {
      return <div></div>
    } else {
    return (
        <Routes>
          <Route path='/' element={(this.state.isAuthenticated) ? <Navigate to='/account'/> : <Navigate to='/login'/> }/>
          <Route path='/login' element={(this.state.isAuthenticated) ?  <Navigate to='/account'/> : <Login onCreateAccountClick={this.doNewCreateAccountClick} accountJustCreated={this.state.accountJustCreated} passwordJustChanged={this.state.passwordJustChanged} onLoginClick={this.doLoginClick}/>}/>
          <Route path='/create' element={<CreateAcount onBackClick={this.doCreateToLogClick} onCreateAccountClick={this.doCreateAccountClick}/>}></Route>
          <Route path='/account' element={(this.state.isAuthenticated) ? <Account onLogoutClick={this.doLogoutClick} onReqHoursClick={this.doReqHoursClick} onReqGroupClick={this.doReqGroupClick}/> : <Navigate to='/login'/>}></Route>
          <Route path='/requestHours' element={(this.state.isAuthenticated) ? <ReqHours onBackClick={this.doBackToAccClick} onLogoutClick={this.doLogoutClick}/> : <Navigate to='/login'/>}></Route>
          <Route path='/requestGroup' element={(this.state.isAuthenticated) ? <ReqGroup onBackClick={this.doBackToAccClick} onLogoutClick={this.doLogoutClick}/> : <Navigate to='/login'/>}></Route>
          <Route path='/changePassword' element={<ChangePass onBackClick={this.doChaPaToLogClick}/>}></Route>
        </Routes>
      );
    }
  };

  doReqGroupClick = (): void => {
    this.props.navigate("/requestGroup")
  }


  doReqHoursClick = (): void => {
    this.props.navigate("/requestHours")
    
  }

  doBackToAccClick = (): void => {
    this.props.navigate("/account");
  }


  doNewCreateAccountClick = (): void => {
    this.props.navigate('/create');
  };


  doCreateToLogClick = (): void => {
    this.setState({accountJustCreated:false, passwordJustChanged: false})
    this.props.navigate('/login');
  };

  doChaPaToLogClick = (passwordJustChanged:boolean): void => {
    this.setState({accountJustCreated:false, passwordJustChanged: passwordJustChanged})
    this.props.navigate('/login');
  }


  doCreateAccountClick = (): void => {
    this.setState({accountJustCreated:true, passwordJustChanged: false})
    this.props.navigate('/login');
  };

  doLoginClick = (): void => {
    this.setState({isAuthenticated: true})
    this.props.navigate('/account');
  }

  doLogoutClick = ():void => {
    this.setState({isLoading: true})
    fetch("api/logout", {
      credentials: 'include', method: "POST", headers: headers })
      .then(this.doLOResp)
      .catch(() => this.doLOError("failed to connect to server"));
  }


  doLOResp = (resp: Response): void => {
    this.setState({isAuthenticated: false, isLoading: false});
    if (!resp.ok) {
      this.doLOError("Unsuccessful Logout")
    }
  };

  doLOError = (msg: string): void => {
      console.error(msg)
  };

}

/** App Factory function */
export const VolunteerAppWithRouter = (): JSX.Element => {
  const navigate = useNavigate();
  return (<VolunteerApp navigate={navigate}></VolunteerApp>);
}