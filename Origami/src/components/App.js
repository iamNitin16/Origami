import React from "react";
import { PropTypes } from "prop-types";
import { connect } from "react-redux";
import AppBar from "material-ui/AppBar";
import { Link, browserHistory } from "react-router";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import { bindActionCreators } from "redux";
import * as loginActions from "../actions/loginActions";
import MenuItem from "material-ui/MenuItem";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import FlatButton from "material-ui/FlatButton";
import io from "socket.io-client";
import userApi from "../api/Github/userApi";
import { Layout, Menu, Icon, Button, Card, Row, Col, Input } from "antd";
import * as rootApi from "../api/CommonLocal/rootSettingsApi";
import "./index.css";
const { Header, Content, Footer, Sider } = Layout;

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      login: false,
      displayLogin: "",
      showTitle: true,
      isFrame: window.location.pathname.split("/")[1] == "frame",
      isRoot:false
    };
    
    this.handleClickAfterLogin = this.handleClickAfterLogin.bind(this);
    this.initiateLogin = this.initiateLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.readSessionToken = this.readSessionToken.bind(this);
    this.clearSessionFlag = this.clearSessionFlag.bind(this);
    this.setSessionFlag = this.setSessionFlag.bind(this);
    let ws_scheme = "ws";
    this.socket = new WebSocket(
      ws_scheme + "://" + window.location.host + "/chat/"
    );
    let socket = this.socket;
    this.socketId = Math.random().toString(36);
    socket.onopen = function() {
      socket.send(
        JSON.stringify({
          event: "ConnectionEstablished",
          socketId: this.socketId
        })
      );
    }.bind(this);
  }

  getChildContext() {
    return {
      socket: this.socket,
      socketId: this.socketId
    };
  }

  componentWillMount() {
    if (
      window.location.pathname.split("/").slice(-1)[0] === "demo" ||
      window.location.pathname.split("/")[1] === "initialsetup"
    ) {
      this.setState({ displayLogin: "none" });
    } else {
      this.setState({ displayLogin: "" });
    }
    rootApi
      .checkRootSettings()
      .then(data => {
        if (
          window.location.pathname !== "/initialsetup" &&
          JSON.parse(data).root_user_github_login_id === null
        ) {
          window.location = "/initialsetup";
        }
         if(JSON.parse(data).root_user_github_login_name == localStorage.getItem("username")) {
          this.setState({ isRoot: true });
        }
      })
      .catch(err => {
        toastr.error("Unauthorized");
        setTimeout(
          () => {
            $("#appbar-progress").css("visibility", "hidden");
            $("#appbar-progress").progress({
              percent: "0%"
            });
          },
          600
        );
      });
  }

  componentDidMount() {
    if (this.props.location.pathname === "/") {
      $("#appbar-progress").css("display", "None");
    } else {
      $("#appbar-progress").css("display", "");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.login !== nextProps.login) {
      this.setState({ login: nextProps.login });
    }
  }

  readSessionToken() {
    return localStorage.getItem("access_token")
      ? localStorage.getItem("access_token")
      : false;
  }

  clearSessionFlag() {
    localStorage.clear();
  }

  setSessionFlag(access_token, username) {
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("username", username);
    localStorage.setItem("gh_access_token_time", Date.now());
  }

  initiateLogin() {
    window.location = "/auth/github/login/";
  }

  logout() {
    this.props.loginactions.Logout();
    this.clearSessionFlag();
    window.location = "/";
  }

  getDocs() {
    window.location = "http://cloudcv-origami.readthedocs.io/en/latest/index.html";
  }

  handleClickAfterLogin(e) {
    if (e.key === "1") {
      browserHistory.push(
        `/u/${localStorage.getItem("username")}/${localStorage.getItem("user_id")}`
      );
    }
    if (e.key === "2") {
      browserHistory.push("/");
    } else if (e.key === "3") {
      browserHistory.push("/ngh/user");
    } else if (e.key === "4") {
      browserHistory.push("/ngh/user/register");
    } else if (e.key === "5") {
      this.getDocs();
    } else if (e.key === "6") {
      this.logout();
    } else if (e.key === "7") {
      browserHistory.push("/initialsetup");
    }
  }

  render() {

    let Root_Setting;
    if(this.state.isRoot)
    {
      Root_Setting=(
              <Menu.Item key="7" style={{ fontSize: "16px" }}>
                <Icon type="setting" />
                <span className="nav-text">Root-Settings</span>
              </Menu.Item>
        )
    }
    else{
      Root_Setting=null;
    }
    if (this.props.location.pathname === "/") {
      $("#appbar-progress").css("display", "None");
    } else {
      $("#appbar-progress").css("display", "");
    }
    if (this.readSessionToken()) {
      this.props.loginactions.Login();
    }
    if (this.state.isFrame) {
      return (
        <Layout style={{ background: "#FEFEFE" }}>
          {this.props.children}
        </Layout>
      );
    }
    if (this.state.login) {
      return (
        <Layout style={{ height: "110vh", background: "#FEFEFE" }}>
          <Sider
            style={{
              overflow: "auto",
              background: "#FEFEFE",
              boxShadow: "10px 0px 20px #E0E0E0"
            }}
            width="200"
          >
            <div id="logo-login">
              <img src="/static/img/origami.png" width="180" />
            </div>
            <Menu
              style={{ background: "#FEFEFE" }}
              mode="inline"
              defaultSelectedKeys={["2"]}
              onClick={this.handleClickAfterLogin}
            >
              <Menu.Item key="1" style={{ fontSize: "16px" }}>
                <Icon type="user" />
                <span className="nav-text">Profile</span>
              </Menu.Item>
              <Menu.Item key="2" style={{ fontSize: "16px" }}>
                <Icon type="video-camera" />
                <span className="nav-text">Discover</span>
              </Menu.Item>
              <Menu.Item key="3" style={{ fontSize: "16px" }}>
                <Icon type="cloud-o" />
                <span className="nav-text">My demos</span>
              </Menu.Item>
              <Menu.Item key="4" style={{ fontSize: "16px" }}>
                <Icon type="plus-circle-o" />
                <span className="nav-text">Create Demo</span>
              </Menu.Item>
              <Menu.Item key="5" style={{ fontSize: "16px" }}>
                <Icon type="question-circle-o" />
                <span className="nav-text">Help</span>
              </Menu.Item>
              <Menu.Item key="6" style={{ fontSize: "16px" }}>
                <Icon type="logout" />
                <span className="nav-text">Logout</span>
              </Menu.Item>

              {Root_Setting}

            </Menu>
          </Sider>
          {this.props.children}
        </Layout>
      );
    } else {
      return (
        <Layout id="layout">
          {this.props.children}
        </Layout>
      );
    }
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  loginactions: PropTypes.object.isRequired,
  login: PropTypes.bool.isRequired
};

App.childContextTypes = {
  socket: PropTypes.object.isRequired,
  socketId: PropTypes.string.isRequired
};

function mapStateToProps(state, ownProps) {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loginactions: bindActionCreators(loginActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
