import React from "react";
import { getCookie, setCookie, deleteCookie } from "./cookie";
import validator, { handleAllFields } from "./controllers/validator";
import { Redirect, Link as RouteLink } from "react-router-dom";
import { NavBar } from "./elements/nav";
import { UForm } from "./elements/Form";
import { fetchAsynchronous } from "./controllers/fetch";
import loading from "./../img/loading.gif";
import {
  login,
  forgotPassword,
  signup,
  mobileverify,
  mobileverifyResend,
  logout,
  adminRegisterValidate,
  adminRegister
} from "./../api";
import loadingForm from "./../img/formloading.gif";
import {
  Grid,
  Link,
  Zoom,
  Button,
  TextField,
  Paper,
  withStyles
} from "@material-ui/core";

const RegisterStyle = () => ({
  label: {
    "&$focusedLabel": {
      color: "#3a87f2"
    }
  },
  focusedLabel: {},
  underline: {
    "&:after": {
      borderBottom: `2px solid #3a87f2`
    }
  },
  button: {
    background: "#3a87f2",
    color: "#ffffff",
    "&:hover": {
      background: "#0068f9"
    }
  }
});

const mobilevStyle = () => ({
  button: {
    background: "#3a87f2",
    color: "#ffffff",
    "&:hover": {
      background: "#0068f9"
    }
  }
});

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      user: "",
      password: "",
      remember_me: false,
      MobileVerify: false,
      message: "",
      disabled: true,
      messageColor: "",
      validators: validator,
      formLoading: false
    };
  }

  updateState = (name, value) => {
    this.setState({ [name]: value });
    return this.state[name];
  };

  componentDidMount() {
    this.setState({ loading: false, hide: "" });
  }

  getInputs = () => {
    let labels = ["Username", "Password", "Remember me"];
    let name = ["user", "password", "remember_me"];
    let type = ["text", "password", "checkbox"];
    let value = [this.state.user, this.state.password, this.state.remember_me];
    let inputs = [];
    for (let i in name) {
      let obj = {};
      obj.name = name[i];
      obj.type = type[i];
      obj.id = name[i];
      obj.labels = labels[i];
      obj.value = value[i];
      obj.handle = this.HandleAllFields;
      inputs.push(obj);
    }
    return inputs;
  };

  HandleAllFields = e => {
    let { name, value } = e.target;
    if (name === "remember_me") {
      let { checked } = e.target;
      value = checked;
    }
    let formFields = ["user", "password", "remember_me"];
    let formFieldValues = [
      this.state.user,
      this.state.password,
      this.state.remember_me
    ];
    handleAllFields(
      name,
      value,
      formFields,
      formFieldValues,
      true,
      validator,
      this.updateState
    );
  };

  HandleClearForm = () => {
    this.setState({
      user: "",
      password: "",
      remember_me: false,
      MobileVerify: false,
      message: "",
      disabled: true,
      messageClass: "red",
      validators: validator
    });
  };

  componentWillUnmount = () => {
    this.HandleClearForm();
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    let s = { marginLeft: -10, marginTop: -10 };
    this.setState({
      message: "",
      formLoading: (
        <img
          src={loadingForm}
          alt="Loading...."
          style={s}
          className="loading"
        />
      )
    });
    let rem = 0;
    if (this.state.remember_me) {
      rem = 1;
    }
    this.setState({ disabled: true });
    let data = {
      user: this.state.user,
      password: this.state.password,
      remember_me: rem
    };
    let headers = {
      "Content-Type": "application/json"
    };
    fetchAsynchronous(login, "POST", data, headers, this.HandleResponse);
  };

  HandleResponse = data => {
    this.setState({
      disabled: false,
      formLoading: false
    });
    if (data.error === 1) {
      // Error occured, show the error
      this.setState({ message: data.message, messageClass: "red" });
    } else if (data.error === -1) {
      // Query the User for his mobile verification OTP
      localStorage.setItem("mobile", data.message);
      this.setState({ mobileVerify: true });
    } else {
      // set the cookies and redirect to home page.
      let date = Date.now();
      if (this.state.remember_me) {
        date = Date.now() + 90 * 60 * 60 * 24 * 1000;
      } else {
        date = Date.now() + 7 * 60 * 60 * 24 * 1000;
      }

      let cookies = [
        {
          key: "token",
          value: data.token,
          age: date
        },
        {
          key: "user",
          value: data.user_id,
          age: date
        },
        {
          key: "role",
          value: data.user,
          age: date
        }
      ];
      setCookie(cookies);
      this.setState({ isLoggedIn: true });
    }
  };

  render = () => {
    let { state: s } = this;
    if (s.isLoggedIn) {
      // return to the home page
      return <Redirect to="/dashboard" />;
    } else {
      if (s.mobileVerify) {
        return <Redirect to="/mobileverify" />;
      }
      document.body.style = "background: #fafafa;";
      let inputs = this.getInputs();
      // render the components
      return (
        <Grid container spacing={24}>
          <Grid item sm={4} />
          <Grid item sm={4}>
            <NavBar value={0} />
            <Zoom in={true}>
              <div className="component">
                <h2 style={{ textAlign: "center" }}>Login</h2>
                <div className="login" style={{ paddingLeft: -10 }}>
                  <UForm
                    formLoading={this.state.formLoading}
                    formClass="formStyle"
                    onClick={this.HandleFormSubmit}
                    button="Login"
                    disabled={this.state.disabled}
                    message={this.state.message}
                    messageClass={this.state.messageClass}
                    inputs={inputs}
                    validators={[
                      this.state.validators["user"].errors[0],
                      this.state.validators["password"].errors[0]
                    ]}
                  />
                  <Link
                    component={RouteLink}
                    style={{ marginLeft: 60, color: "#3a87f2" }}
                    to="/forgotpassword"
                  >
                    Forgot Password ?
                  </Link>{" "}
                  |{" "}
                  <Link
                    component={RouteLink}
                    to="/signup"
                    style={{ color: "#3a87f2" }}
                  >
                    Don't have account ?
                  </Link>{" "}
                </div>
              </div>
            </Zoom>
          </Grid>
          <Grid item sm={4} />
        </Grid>
      );
    }
  };
}

class RegisterComponent extends React.Component {
  constructor(props) {
    super(props);
    let link = "";
    console.log(this.props);
    if (this.props.user_type === "Admin") {
      link = this.props.link;
    }
    this.state = {
      isLoggedIn: getCookie("token")[1],
      username: "",
      password: "",
      confirm_password: "",
      email: "",
      mobile: "",
      vcode: "",
      message: "",
      disabled: true,
      messageClass: "",
      validators: validator,
      formLoading: false,
      checked: false,
      user_type: this.props.user_type,
      link: link,
      loading: true,
      error: false
    };
  }

  updateState = (name, value) => {
    this.setState({ [name]: value });
    return this.state[name];
  };

  callback = response => {
    if (response.error === 1) {
      this.setState({ error: true, loading: false });
    } else {
      this.setState({ loading: false });
    }
  };

  componentDidMount() {
    if (this.state.user_type === "Admin") {
      // Validate the link
      fetchAsynchronous(
        adminRegisterValidate,
        "POST",
        { link: this.state.link },
        { "Content-Type": "application/json" },
        this.callback
      );
    } else {
      this.setState({ loading: false });
    }
  }

  HandleAllFields = e => {
    let { name, value } = e.target;
    let formFields = [
      "username",
      "password",
      "confirm_password",
      "email",
      "mobile"
    ];
    let formFieldValues = [
      this.state.username,
      this.state.password,
      this.state.confirm_password,
      this.state.email,
      this.state.mobile
    ];
    handleAllFields(
      name,
      value,
      formFields,
      formFieldValues,
      true,
      validator,
      this.updateState
    );
  };

  HandleClearForm = () => {
    this.setState({
      username: "",
      password: "",
      confirm_password: "",
      email: "",
      mobile: "",
      message: "",
      disabled: true,
      success: false,
      messageClass: "",
      user_type: "",
      validators: validator
    });
  };

  componentWillUnmount = () => {
    this.HandleClearForm();
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    let s = { marginTop: -40 };
    this.setState({
      message: "",
      formLoading: (
        <img
          src={loadingForm}
          alt="Loading...."
          style={s}
          className="loading"
        />
      )
    });
    this.setState({ disabled: true });
    let data = {
      username: this.state.username,
      password: this.state.password,
      confirm_password: this.state.confirm_password,
      user_type: this.state.user_type,
      email: this.state.email,
      state: this.state.state,
      mobile: this.state.mobile
    };
    let headers = {
      "Content-Type": "application/json"
    };
    let uri = signup;
    if (this.state.user_type === "Admin") {
      uri = adminRegister + this.state.link + "/";
    }
    fetchAsynchronous(uri, "POST", data, headers, this.HandleResponse);
  };

  HandleResponse = data => {
    this.setState({
      disabled: false
    });
    if (data.error === 1) {
      // Error occured, show the error
      this.setState({
        message: data.message,
        messageClass: "red",
        formLoading: false,
        disabled: false
      });
    } else {
      // Redirect to mobile number veriification page.
      localStorage.setItem("mobile", this.state.mobile);
      this.setState({ success: true });
    }
  };

  render = () => {
    let { classes } = this.props;
    document.body.style = "background: #fafafa;";
    let { state: obj } = this;
    if (obj.isLoggedIn) {
      //   return to the home page
      return <Redirect to="/dashboard" />;
    } else {
      if (this.state.success) {
        return (
          <Redirect
            to={{
              pathname: "/mobileverify"
            }}
          />
        );
      }
      document.body.style = "background: #fafafa;";
      // render the components
      return (
        <React.Fragment>
          {this.state.loading === true ? (
            <React.Fragment>
              <div style={{ marginTop: "30vh", marginLeft: "40vw" }}>
                <img src={loading} alt="loading" />
              </div>
            </React.Fragment>
          ) : this.state.error === true ? (
            <h1>Invalid Link</h1>
          ) : (
            <React.Fragment>
              <NavBar value={1} />
              <Zoom in={true}>
                <Grid container spacing={24}>
                  <Grid item md={4} />
                  <Grid item md={5}>
                    <Paper
                      style={{
                        marginTop: "calc(80px + 6vw)",
                        paddingTop: "30px",
                        width: "90%"
                      }}
                    >
                      <h3 style={{ textAlign: "center" }}>Register</h3>
                      <div>
                        <div
                          style={{
                            textAlign: "center",
                            color: this.state.messageClass,
                            paddingBottom: 20
                          }}
                        >
                          {" "}
                          {this.state.message !== "" ? this.state.message : ""}
                        </div>
                        <form>
                          <Grid
                            container
                            spacing={24}
                            style={{ marginLeft: 20 }}
                          >
                            <Grid item md={5}>
                              <TextField
                                id="username"
                                name="username"
                                fullWidth
                                onChange={this.HandleAllFields}
                                value={this.state.username}
                                type="text"
                                label="Username"
                                helperText={
                                  this.state.validators["username"].errors[0]
                                }
                                InputProps={{
                                  classes: {
                                    root: classes.underline
                                  }
                                }}
                                InputLabelProps={{
                                  classes: {
                                    root: classes.label,
                                    focused: classes.focusedLabel
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item md={5}>
                              <TextField
                                id="email"
                                name="email"
                                fullWidth
                                onChange={this.HandleAllFields}
                                value={this.state.email}
                                type="email"
                                label="Email"
                                helperText={
                                  this.state.validators["email"].errors[0]
                                }
                                InputProps={{
                                  classes: {
                                    root: classes.underline
                                  }
                                }}
                                InputLabelProps={{
                                  classes: {
                                    root: classes.label,
                                    focused: classes.focusedLabel
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item md={5}>
                              <TextField
                                id="password"
                                name="password"
                                onChange={this.HandleAllFields}
                                value={this.state.password}
                                fullWidth
                                type="password"
                                label="Password"
                                helperText={
                                  this.state.validators["password"].errors[0]
                                }
                                InputProps={{
                                  classes: {
                                    root: classes.underline
                                  }
                                }}
                                InputLabelProps={{
                                  classes: {
                                    root: classes.label,
                                    focused: classes.focusedLabel
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item md={5}>
                              <TextField
                                id="confirm_password"
                                name="confirm_password"
                                onChange={this.HandleAllFields}
                                value={this.state.confirm_password}
                                fullWidth
                                type="password"
                                label="Re-Type Password"
                                helperText={
                                  this.state.validators["confirm_password"]
                                    .errors[0]
                                }
                                InputProps={{
                                  classes: {
                                    root: classes.underline
                                  }
                                }}
                                InputLabelProps={{
                                  classes: {
                                    root: classes.label,
                                    focused: classes.focusedLabel
                                  }
                                }}
                              />
                            </Grid>
                            <Grid item md={5}>
                              <TextField
                                id="mobile"
                                name="mobile"
                                onChange={this.HandleAllFields}
                                value={this.state.mobile}
                                fullWidth
                                type="text"
                                label="Mobile"
                                helperText={
                                  this.state.validators["mobile"].errors[0]
                                }
                                InputProps={{
                                  classes: {
                                    root: classes.underline
                                  }
                                }}
                                InputLabelProps={{
                                  classes: {
                                    root: classes.label,
                                    focused: classes.focusedLabel
                                  }
                                }}
                              />
                            </Grid>
                            <Grid
                              item
                              md={10}
                              style={{
                                marginTop: "25px"
                              }}
                            >
                              {this.state.formLoading !== false ? (
                                this.state.formLoading
                              ) : (
                                <Button
                                  variant="contained"
                                  className={classes.button}
                                  disabled={this.state.disabled}
                                  onClick={this.HandleFormSubmit}
                                  style={{ width: "100%" }}
                                >
                                  Register
                                </Button>
                              )}
                            </Grid>
                          </Grid>
                        </form>
                      </div>
                    </Paper>
                  </Grid>
                  <Grid item md={3} />
                </Grid>
              </Zoom>
            </React.Fragment>
          )}
        </React.Fragment>
      );
    }
  };
}

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      email: "",
      message: "",
      disabled: true,
      messageClass: "",
      success: true,
      validators: validator,
      formLoading: false,
      checked: false
    };
  }

  componentDidMount = () => {
    this.setState({ checked: true });
  };

  updateState = (name, value) => {
    this.setState({ [name]: value });
    return this.state[name];
  };

  getInputs = () => {
    let inputs = [],
      obj = {};
    obj.name = "email";
    obj.type = "email";
    obj.labels = "Email";
    obj.value = this.state.email;
    obj.handle = this.HandleAllFields;
    inputs.push(obj);
    return inputs;
  };

  HandleAllFields = e => {
    let { name, value } = e.target;
    let formFields = ["email"];
    let formFieldValues = [this.state.email];
    handleAllFields(
      name,
      value,
      formFields,
      formFieldValues,
      true,
      validator,
      this.updateState
    );
  };

  HandleClearForm = () => {
    this.setState({
      email: "",
      message: "",
      disabled: true,
      messageClass: "",
      validators: validator,
      formLoading: false
    });
  };

  componentWillUnmount = () => {
    this.HandleClearForm();
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    let s = { marginLeft: 60, marginTop: -10 };
    this.setState({
      message: "",
      formLoading: (
        <img
          src={loadingForm}
          alt="Loading...."
          style={s}
          className="loading"
        />
      )
    });
    this.setState({ disabled: true });
    let data = {
      email: this.state.email
    };
    let headers = {
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      forgotPassword,
      "POST",
      data,
      headers,
      this.HandleResponse
    );
  };

  HandleResponse = data => {
    this.setState({
      disabled: false,
      formLoading: false
    });
    if (data.error === 1) {
      // Error occured, show the error
      this.setState({ message: data.message, messageClass: "red" });
    } else {
      this.setState({ message: data.message, messageClass: "green" });
    }
  };

  render = () => {
    let { state: obj } = this;
    if (obj.isLoggedIn) {
      //   return to the home page
      return <Redirect to="/home" />;
    } else {
      // Display the Form to the user.
      document.body.style = "background: #fafafa;";
      let inputs = this.getInputs();
      // render the components
      return (
        <div style={{ display: this.state.hide }}>
          <Grid container spacing={24}>
            <Grid item sm={4} />
            <Grid item sm={4}>
              <div style={{ display: this.state.hide }}>
                <NavBar value={false} />
                <Zoom in={this.state.checked}>
                  <div className="component">
                    <h4>Forgot Password</h4>
                    <div
                      className="forgot_password"
                      style={{ paddingLeft: -10 }}
                    >
                      <UForm
                        formLoading={this.state.formLoading}
                        formClass="formStyle"
                        onClick={this.HandleFormSubmit}
                        button="Validate"
                        disabled={this.state.disabled}
                        message={this.state.message}
                        messageClass={this.state.messageClass}
                        inputs={inputs}
                        validators={[this.state.validators["email"].errors[0]]}
                      />
                    </div>
                  </div>
                </Zoom>
              </div>
            </Grid>
            <Grid item sm={4} />
          </Grid>
        </div>
      );
    }
  };
}

class MobileVerifyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mobile: localStorage.getItem("mobile"),
      code: "",
      message: "",
      disabled: true,
      messageClass: "",
      validators: validator,
      formLoading: false,
      success: false,
      checked: false,
      resendLoading: false
    };
  }

  updateState = (name, value) => {
    this.setState({ [name]: value });
    return this.state[name];
  };

  getInputs = () => {
    let obj = {};
    obj.name = "code";
    obj.labels = "OTP";
    obj.value = this.state.code;
    obj.type = "password";
    obj.handle = this.HandleAllFields;
    return [obj];
  };

  HandleAllFields = e => {
    let { name, value } = e.target;
    let formFields = ["code"];
    let formFieldValues = [this.state.code];
    handleAllFields(
      name,
      value,
      formFields,
      formFieldValues,
      true,
      validator,
      this.updateState
    );
  };

  HandleClearForm = () => {
    this.setState({
      mobile: "",
      vcode: "",
      message: "",
      disabled: true,
      success: false,
      messageClass: "",
      validators: validator,
      formLoading: false,
      checked: false,
      resendLoading: false
    });
  };

  componentWillUnmount = () => {
    this.HandleClearForm();
  };

  HandleFormSubmit = e => {
    e.preventDefault();
    let s = { marginLeft: -10, marginTop: -10 };
    this.setState({
      message: "",
      formLoading: (
        <img
          src={loadingForm}
          alt="Loading...."
          style={s}
          className="loading"
        />
      )
    });
    this.setState({ disabled: true });
    let data = {
      mobile: this.state.mobile,
      code: this.state.code
    };
    let headers = {
      "Content-Type": "application/json"
    };
    fetchAsynchronous(mobileverify, "POST", data, headers, this.HandleResponse);
  };

  componentDidMount() {
    this.setState({ checked: true });
  }

  HandleResponse = data => {
    this.setState({
      disabled: false,
      formLoading: false
    });
    if (data.error === 1) {
      // Error occured, show the error
      this.setState({ message: data.message, messageClass: "red" });
    } else {
      // Update the entire component and show some animation
      this.setState({ success: true });
      localStorage.removeItem("mobile");
    }
  };

  resendOTP = () => {
    let s = { marginLeft: 100, marginTop: -10 };
    this.setState({
      resendLoading: (
        <img
          src={loadingForm}
          alt="Loading...."
          style={s}
          className="loading"
        />
      )
    });

    let data = {
      mobile: this.state.mobile
    };
    let headers = {
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      mobileverifyResend,
      "POST",
      data,
      headers,
      this.resendOTPResponse
    );
  };

  resendOTPResponse = data => {
    this.setState({
      resendLoading: false,
      message: data.message,
      messageClass: "green"
    });
  };

  render = () => {
    let { classes } = this.props;
    let header = "Mobile Verification";
    if (localStorage.getItem("mobile") === null) {
      return <h2>Invalid request.</h2>;
    }
    // Display the Form to the user.
    document.body.style = "background: #fafafa;";
    let inputs = this.getInputs();

    let component;
    if (this.state.success) {
      component = (
        <div style={{ marginTop: "40vh" }}>
          <div className="checkmark-circle">
            <div className="background" />
            <div className="checkmark draw" />
            <RouteLink to="/login">
              <Button
                style={{ marginTop: 160, marginLeft: 30 }}
                variant="contained"
                className={classes.button}
              >
                Login
              </Button>
            </RouteLink>
          </div>
        </div>
      );
    } else {
      component = (
        <div className="component">
          <div className="mobile_verify">
            <h4>{header}</h4>
            <UForm
              formLoading={this.state.formLoading}
              formClass="formStyle"
              onClick={this.HandleFormSubmit}
              button="Validate"
              disabled={this.state.disabled}
              message={this.state.message}
              messageClass={this.state.messageClass}
              inputs={inputs}
              validators={[this.state.validators["code"].errors[0]]}
            />
          </div>
          {this.state.resendLoading !== false ? (
            this.state.resendLoading
          ) : (
            <Button
              className={"resend" + " " + classes.button}
              variant="contained"
              onClick={this.resendOTP}
              style={{ marginLeft: 50 }}
            >
              Resend OTP ?
            </Button>
          )}
        </div>
      );
    }
    // render the components
    return (
      <Grid container spacing={24}>
        <Grid item sm={4} />
        <Grid item sm={4}>
          <NavBar value={0} />
          <Zoom in={this.state.checked}>{component}</Zoom>
        </Grid>
        <Grid item sm={4} />
      </Grid>
    );
  };
}

class Logout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      text: "",
      loading: (
        <div style={{ marginTop: "30vh", marginLeft: "40vw" }}>
          <img src={loading} alt="loadng" />
        </div>
      )
    };
  }

  componentDidMount() {
    // call the 'LOGOUT API' and 'DELETE THE STORED COOKIES'
    if (this.state.isLoggedIn) {
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value
      };
      fetchAsynchronous(
        logout,
        "POST",
        undefined,
        headers,
        this.HandleResponse
      );
    } else {
      this.setState({ loading: false, text: "You have already logged out !!" });
    }
  }

  HandleResponse = response => {
    deleteCookie(["token", "user", "role"]);
    if (response.error === 0) {
      this.setState({
        loading: false,
        text: "You have successfully logged out!!"
      });
    } else {
      this.setState({ loading: false, text: "You have already logged out!!" });
    }
  };

  render = () => {
    document.body.style = "background: #fafafa;";
    // logout the user
    return (
      <React.Fragment>
        {this.state.loading === false ? (
          <React.Fragment>
            <NavBar value={false} />
            <Grid container spaces={24} style={{ marginTop: "30vh" }}>
              <Grid item md={4} />
              <Grid item md={4}>
                <Zoom in={true}>
                  <Paper>
                    <div style={{ padding: 20 }}>
                      <h4 style={{ color: "green", marginLeft: "20%" }}>
                        {this.state.text}
                      </h4>
                      <RouteLink
                        style={{
                          marginLeft: "10vw",
                          textDecoration: "none"
                        }}
                        to="/login"
                      >
                        <Button color="primary">Login back ?</Button>
                      </RouteLink>
                    </div>
                  </Paper>
                </Zoom>
              </Grid>
              <Grid item md={4} />
            </Grid>
          </React.Fragment>
        ) : (
          this.state.loading
        )}
      </React.Fragment>
    );
  };
}

const MobileVerify = withStyles(mobilevStyle)(MobileVerifyComponent);
const Login = LoginComponent;
const Register = withStyles(RegisterStyle)(RegisterComponent);
export { Login, Register, ForgotPassword, Logout, MobileVerify };
