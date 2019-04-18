import React from "react";
import { NavBar } from "./elements/nav";
import { getCookie } from "./cookie";
import validator, { updateValidators } from "./controllers/validator";
import {
  Grid,
  Zoom,
  TextField,
  Button,
  Modal,
  Paper,
  withStyles
} from "@material-ui/core";
import {
  profile,
  passwordUpdate,
  mobileverify,
  adminRegisterGenerate
} from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";
import loading from "./../img/loading.gif";
import { Redirect } from "react-router-dom";
import loadingForm from "./../img/formloading.gif";
import { CopyToClipboard } from "react-copy-to-clipboard";

var obj = "";
if (getCookie("token")[1]) {
  obj = {
    username: "",
    email: "",
    access: ""
  };
}

const profilestyle = () => ({
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

class ProfileComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      originalState: Object.assign({}, obj),
      updatedState: Object.assign({}, obj),
      mobileFetched: "",
      mobile: "",
      old_password: "",
      password: "",
      confirm_password: "",
      message: ["", "", "", ""],
      messageClass: ["", "", "", ""],
      validators: validator,
      formLoading: [false, false, false, false, false],
      disabled: [true, true, true, true],
      componentLoading: true,
      checked: true,
      modal: false,
      modala: false,
      link: "",
      otp: ""
    };
  }

  HandleAPIFetch = data => {
    if (data.hasOwnProperty("error")) {
      alert(data.message);
    } else {
      let obj = {
        username: data.username,
        email: data.email,
        state: data.profile.state,
        access: data.role
      };
      this.setState({
        originalState: Object.assign({}, obj),
        updatedState: Object.assign({}, obj),
        mobile: data.profile.mobile,
        mobileFetched: data.profile.mobile,
        componentLoading: false
      });
    }
  };

  componentDidMount() {
    if (this.state.isLoggedIn) {
      this.setState({ checked: true });
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value
      };
      let uri = profile + getCookie("user")[0].value + "/";
      fetchAsynchronous(uri, "GET", "", headers, this.HandleAPIFetch);
    }
  }

  HandleAllFields = (e, val) => {
    let { name, value } = e.target;
    let validate = Object.assign({}, validator);
    validate[name] = updateValidators(name, value);
    let { disabled: d } = this.state;
    // Check if the form to be submitted is valid.
    if (val === 1) {
      // check for validity of the second form
      this.setState({ [name]: value, validators: validate });
      if (
        this.state.validators["password"].errors.length === 0 &&
        this.state.validators["confirm_password"].errors.length === 0 &&
        this.state.validators["old_password"].errors.length === 0
      ) {
        // valid
        this.setState({ disabled: [d[0], false, d[2], d[3]] });
      } else {
        this.setState({ disabled: [d[0], true, d[2], d[3]] });
      }
    } else if (val === 0) {
      let obj = this.state.updatedState;
      obj[name] = value;
      this.setState({ updatedState: obj, validators: validate });
      // check for the validity of the first form
      let checkValid = this.CompareState();
      if (checkValid.valid) {
        this.setState({ disabled: [false, d[1], d[2], d[3]] });
      } else {
        this.setState({ disabled: [true, d[1], d[2], d[3]] });
      }
    } else if (val === 2) {
      this.setState({ mobile: value, validators: validate });
      if (
        this.state.validators["mobile"].errors.length === 0 &&
        value !== this.state.mobileFetched
      ) {
        this.setState({ disabled: [d[0], d[1], false, d[3]] });
      } else {
        this.setState({
          disabled: [d[0], d[1], true, d[3]]
        });
      }
    } else if (val === 3) {
      this.setState({ otp: value, validators: validate });
      if (validate["code"].errors.length === 0 && value.length > 0) {
        this.setState({ disabled: [d[0], d[1], d[2], false] });
      } else {
        this.setState({ disabled: [d[0], d[1], d[2], true] });
      }
    }
  };

  CompareState = () => {
    let rv = { valid: false };
    for (let i in this.state.originalState) {
      if (i === "access" || i === "state") {
        continue;
      }
      if (
        this.state.originalState[i] !== this.state.updatedState[i] &&
        this.state.validators[i].errors.length === 0
      ) {
        rv[i] = this.state.updatedState[i];
        rv.valid = true;
      } else {
        if (this.state.validators[i].errors.length !== 0) {
          rv.valid = false;
        }
      }
    }
    return rv;
  };

  HandleFormSubmit(e, form) {
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value
    };
    let { formLoading: fl, message: m, messageClass: mc } = this.state;
    if (form === 0) {
      // Update email/username
      let loading = (
        <img
          src={loadingForm}
          alt="Loading...."
          style={{ marginTop: -30 }}
          className="loading"
        />
      );
      this.setState({
        formLoading: [loading, fl[1], fl[2], fl[3], fl[4]],
        message: ["", m[1], m[2], m[3]],
        messageClass: ["", mc[1], mc[2], mc[3]]
      });
      let data = this.CompareState();
      delete data.valid;
      let uri = profile + getCookie("user")[0].value + "/";
      headers["Content-Type"] = "application/json";
      fetchAsynchronous(uri, "PATCH", data, headers, this.HandleUpdatedData);
    } else if (form === 1) {
      // Update user password
      let loading = (
        <img
          src={loadingForm}
          alt="Loading...."
          style={{ marginLeft: 30 }}
          className="loading"
        />
      );
      this.setState({
        formLoading: [fl[0], loading, fl[2], fl[3], fl[4]],
        message: [m[0], "", m[2], m[3]],
        messageClass: [mc[0], "", mc[2], mc[3]]
      });
      let data = {
        password: this.state.old_password,
        new_password: this.state.password,
        confirm_password: this.state.confirm_password
      };
      headers["Content-Type"] = "application/json";
      fetchAsynchronous(
        passwordUpdate,
        "PATCH",
        data,
        headers,
        this.HandlePasswordUpdate
      );
    } else if (form === 2) {
      // Update user mobile number
      let data = {
        profile: {
          mobile: this.state.mobile
        }
      };
      let loading = (
        <img
          src={loadingForm}
          alt="Loading...."
          style={{ marginTop: -1 }}
          className="loading"
        />
      );
      this.setState({
        formLoading: [fl[0], fl[1], loading, fl[3], fl[4]],
        message: [m[0], m[1], "", m[3]],
        messageClass: [mc[0], mc[1], "", mc[3]]
      });
      let uri = profile + getCookie("user")[0].value + "/";
      headers["Content-Type"] = "application/json";
      fetchAsynchronous(uri, "PATCH", data, headers, this.HandleMobileUpdate);
    } else if (form === 3) {
      // Update user mobile number
      let data = {
        mobile: this.state.mobile,
        code: this.state.otp
      };
      let loading = (
        <img
          src={loadingForm}
          alt="Loading...."
          style={{ marginLeft: "20%" }}
          className="loading"
        />
      );
      this.setState({
        formLoading: [fl[0], fl[1], fl[2], loading, fl[4]],
        message: [m[0], m[1], m[2], ""],
        messageClass: [mc[0], mc[1], mc[2], ""]
      });
      headers["Content-Type"] = "application/json";
      fetchAsynchronous(mobileverify, "POST", data, headers, this.HandleOTP);
    }
  }

  HandleOTP = response => {
    let { formLoading: f, message: m, messageClass: mc } = this.state;
    if (response.error === 1) {
      this.setState({
        formLoading: [f[0], f[1], f[2], false, f[4]],
        message: [m[0], m[1], m[2], response.message],
        messageClass: [mc[0], mc[1], mc[2], "red"]
      });
    } else {
      this.setState({
        modal: false,
        formLoading: [f[0], f[1], f[2], false, f[4]],
        message: [m[0], m[1], response.message, ""],
        messageClass: [mc[0], mc[1], "green", ""]
      });
    }
  };

  HandleUpdatedData = response => {
    let { formLoading: f, message: m, messageClass: mc } = this.state;
    let messageClass = "green";
    if (response.error === 1) {
      messageClass = "red";
    }

    this.setState({
      formLoading: [false, f[1], f[2], f[3], f[4]],
      message: [response.message, m[1], m[2], m[3]],
      messageClass: [messageClass, mc[1], mc[2], mc[3]]
    });
  };

  HandlePasswordUpdate = response => {
    let { formLoading: f, message: m, messageClass: mc } = this.state;
    let messageClass = "green";
    if (response.error === 1) {
      messageClass = "red";
    }
    if (response.error === 0) {
      this.setState({
        old_password: "",
        password: "",
        confirm_password: ""
      });
    }
    this.setState({
      formLoading: [f[0], false, f[2], f[3], f[4]],
      message: [m[0], response.message, m[2], m[3]],
      messageClass: [mc[0], messageClass, mc[2], mc[3]]
    });
  };
  HandleMobileUpdate = response => {
    let { formLoading: f, message: m, messageClass: mc } = this.state;
    if (response.error === 1) {
      this.setState({
        formLoading: [f[0], f[1], false, f[3], f[4]],
        message: [m[0], m[1], response.message, m[3]],
        messageClass: [mc[0], mc[1], "red", mc[3]]
      });
    } else {
      // Show the model for OTP
      this.setState({
        modal: true,
        formLoading: [f[0], f[1], false, f[3], f[4]]
      });
    }
  };

  displayGeneratedLink = response => {
    let { formLoading: f } = this.state;
    this.setState({
      formLoading: [f[0], f[1], f[2], f[3], false],
      link: "http://localhost:3000/admin/register/" + response.link + "/",
      modala: true
    });
  };

  GenerateAdminLink = () => {
    let { formLoading: f } = this.state;
    let loading = (
      <img
        src={loadingForm}
        alt="Loading...."
        style={{ marginTop: -1 }}
        className="loading"
      />
    );
    this.setState({ formLoading: [f[0], f[1], f[2], f[3], loading] });
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value
    };
    fetchAsynchronous(
      adminRegisterGenerate,
      "POST",
      undefined,
      headers,
      this.displayGeneratedLink
    );
  };

  HandleClearForm = () => {
    this.setState({
      isLoggedIn: getCookie("token")[1],
      originalState: Object.assign({}, obj),
      updatedState: Object.assign({}, obj),
      password: "",
      confirm_password: "",
      message: ["", "", ""],
      messageClass: ["", "", "", ""],
      validators: Object.assign({}, validator), // This is the validator to the 'updatedState'
      formLoading: [false, false, false],
      componentLoading: true,
      checked: true
    });
  };

  componentWillUnmount = () => {
    this.HandleClearForm();
  };

  render() {
    if (!this.state.isLoggedIn) {
      return <Redirect to="/login" />;
    }
    document.body.style = "background: #fafafa;";
    let { classes } = this.props;
    return (
      <React.Fragment>
        <NavBar value={false} />
        {/* Modal to evaluate OTP */}
        <Modal
          aria-labelledby="OTP confirmation"
          aria-describedby="OTP confirmation"
          open={this.state.modal}
          style={{
            top: "30vh",
            marginLeft: "40vw",
            marginRight: "40vw"
          }}
          onClose={() => {
            this.setState({ modal: false });
          }}
        >
          <Paper>
            <form>
              <div
                style={{
                  paddingLeft: 60,
                  color: this.state.messageClass[3],
                  paddingBottom: 5
                }}
              >
                <b>
                  {" "}
                  {this.state.message[3] !== "" ? this.state.message[3] : ""}
                </b>
              </div>
              <div style={{ marginLeft: 20, marginTop: 20 }}>
                <TextField
                  id="code"
                  name="code"
                  onChange={e => {
                    this.HandleAllFields(e, 3);
                  }}
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
                  value={this.state.otp}
                  type="password"
                  label="OTP"
                  helperText={this.state.validators["code"].errors[0]}
                />
              </div>
              <div>
                {this.state.formLoading[3] !== false ? (
                  this.state.formLoading[3]
                ) : (
                  <Button
                    variant="contained"
                    disabled={this.state.disabled[3]}
                    onClick={e => {
                      this.HandleFormSubmit(e, 3);
                    }}
                    style={{
                      marginTop: 10
                    }}
                    className={"register " + classes.button}
                  >
                    Verify Mobile
                  </Button>
                )}
              </div>
            </form>
          </Paper>
        </Modal>

        <Modal
          aria-labelledby="Admin Register Link Gereration"
          aria-describedby="Admin Register Link Gereration"
          open={this.state.modala}
          style={{
            top: "30vh",
            marginLeft: "18vw",
            marginRight: "18vw"
          }}
          onClose={() => {
            this.setState({ modala: false });
          }}
        >
          <Paper style={{ padding: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "#edefe6", padding: 10 }}>
                {this.state.link}
              </div>
              <CopyToClipboard text={this.state.link}>
                <Button
                  variant="contained"
                  style={{
                    marginTop: 10
                  }}
                  className={classes.button}
                >
                  Copy
                </Button>
              </CopyToClipboard>
            </div>
          </Paper>
        </Modal>

        {this.state.componentLoading ? (
          <div style={{ marginLeft: "40vw", marginTop: "25vh" }}>
            {" "}
            <img src={loading} alt="Loading..." />
          </div>
        ) : (
          <div style={{ marginTop: "calc(100px + 5vh)" }}>
            <Grid container spaces={24}>
              <Grid item md={1} />
              <Grid item md={6}>
                <h1 style={{ color: "#1e4789" }}>Account Settings</h1>
                <p style={{ color: "#c0c3c6", marginTop: -20 }}>
                  Edit your profile here
                </p>
                <Zoom in={this.state.checked}>
                  <div className="profile_component">
                    <div
                      style={{
                        marginLeft: "30%",
                        color: this.state.messageClass[0],
                        paddingBottom: 5
                      }}
                    >
                      <b>
                        {" "}
                        {this.state.message[0] !== ""
                          ? this.state.message[0]
                          : ""}
                      </b>
                    </div>
                    <form>
                      <Grid container spacing={24} style={{ marginLeft: 20 }}>
                        <Grid item md={5} style={{ marginLeft: "5%" }}>
                          <TextField
                            id="username"
                            name="username"
                            onChange={e => {
                              this.HandleAllFields(e, 0);
                            }}
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
                            value={this.state.updatedState.username}
                            type="text"
                            label="Username"
                            helperText={
                              this.state.validators["username"].errors[0]
                            }
                          />
                        </Grid>
                        <Grid item md={5} style={{ marginLeft: "5%" }}>
                          <TextField
                            id="email"
                            name="email"
                            onChange={e => {
                              this.HandleAllFields(e, 0);
                            }}
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
                            value={this.state.updatedState.email}
                            type="email"
                            label="Email"
                            helperText={
                              this.state.validators["email"].errors[0]
                            }
                          />
                        </Grid>
                        {getCookie("role")[0].value === "Unpaid" ? (
                          ""
                        ) : (
                          <Grid item md={5} style={{ marginLeft: "5%" }}>
                            <TextField
                              id="role"
                              name="role"
                              InputProps={{
                                classes: {
                                  root: classes.underline
                                },
                                readOnly: true
                              }}
                              InputLabelProps={{
                                classes: {
                                  root: classes.label,
                                  focused: classes.focusedLabel
                                }
                              }}
                              value={this.state.updatedState.access}
                              type="text"
                              label="User Role"
                              helperText="read-only"
                            />
                          </Grid>
                        )}

                        <Grid
                          item
                          md={12}
                          style={{
                            marginTop: "25px",
                            marginLeft: "25px",
                            marginRight: "25px"
                          }}
                        >
                          {this.state.formLoading[0] !== false ? (
                            this.state.formLoading[0]
                          ) : (
                            <Button
                              variant="contained"
                              disabled={this.state.disabled[0]}
                              onClick={e => {
                                this.HandleFormSubmit(e, 0);
                              }}
                              className={"register " + classes.button}
                            >
                              Update Profile
                            </Button>
                          )}
                        </Grid>
                      </Grid>
                    </form>
                  </div>
                </Zoom>
              </Grid>
              <Grid item md={4}>
                <Zoom in={this.state.checked}>
                  <div className="profile_password_component">
                    <div
                      style={{
                        paddingLeft: 60,
                        color: this.state.messageClass[1],
                        paddingBottom: 5
                      }}
                    >
                      <b>
                        {" "}
                        {this.state.message[1] !== ""
                          ? this.state.message[1]
                          : ""}
                      </b>
                    </div>
                    <form>
                      <div style={{ marginLeft: 20 }}>
                        <TextField
                          id="old_password"
                          name="old_password"
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
                          onChange={e => {
                            this.HandleAllFields(e, 1);
                          }}
                          value={this.state.old_password}
                          type="password"
                          label="password"
                          helperText={
                            this.state.validators["old_password"].errors[0]
                          }
                        />
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 20 }}>
                        <TextField
                          id="password"
                          name="password"
                          onChange={e => {
                            this.HandleAllFields(e, 1);
                          }}
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
                          value={this.state.password}
                          type="password"
                          label="New password"
                          helperText={
                            this.state.validators["password"].errors[0]
                          }
                        />
                      </div>
                      <div style={{ marginLeft: 20, marginTop: 20 }}>
                        <TextField
                          id="confirm_password"
                          name="confirm_password"
                          onChange={e => {
                            this.HandleAllFields(e, 1);
                          }}
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
                          value={this.state.confirm_password}
                          type="password"
                          label="Re-Type Password"
                          helperText={
                            this.state.validators["confirm_password"].errors[0]
                          }
                        />
                      </div>
                      {this.state.formLoading[1] !== false ? (
                        this.state.formLoading[1]
                      ) : (
                        <Button
                          style={{ marginLeft: 50, marginTop: 20 }}
                          variant="contained"
                          className={classes.button}
                          disabled={this.state.disabled[1]}
                          onClick={e => {
                            this.HandleFormSubmit(e, 1);
                          }}
                        >
                          Update Password
                        </Button>
                      )}
                    </form>
                  </div>
                </Zoom>
              </Grid>
              <Grid item md={1} />
            </Grid>
            <Grid container spaces={24} style={{ marginTop: 10 }}>
              <Grid item md={1} />
              <Grid item md={6}>
                <Zoom in={this.state.checked}>
                  <div className="profile_component" style={{ marginTop: 20 }}>
                    <form>
                      <div
                        style={{
                          marginLeft: "30%",
                          color: this.state.messageClass[2],
                          paddingBottom: 5
                        }}
                      >
                        <b>
                          {" "}
                          {this.state.message[2] !== ""
                            ? this.state.message[2]
                            : ""}
                        </b>
                      </div>
                      <div style={{ marginLeft: "15vw" }}>
                        <TextField
                          id="mobile"
                          name="mobile"
                          onChange={e => {
                            this.HandleAllFields(e, 2);
                          }}
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
                          value={this.state.mobile}
                          type="text"
                          label="Mobile"
                          helperText={this.state.validators["mobile"].errors[0]}
                        />
                      </div>
                      <div>
                        {this.state.formLoading[2] !== false ? (
                          this.state.formLoading[2]
                        ) : (
                          <Button
                            variant="contained"
                            className={classes.button}
                            disabled={this.state.disabled[2]}
                            style={{ marginTop: 15, marginLeft: "15vw" }}
                            onClick={e => {
                              this.HandleFormSubmit(e, 2);
                            }}
                          >
                            Update mobile
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>
                </Zoom>
              </Grid>
              <Grid item md={5}>
                <Zoom in={this.state.checked}>
                  {getCookie("role")[0].value === "Admin" ? (
                    <div
                      className="profile_component"
                      style={{ marginTop: 20, width: "20vw" }}
                    >
                      <h3 style={{ marginLeft: 10 }}>
                        Generate link for Admin Registration ?
                      </h3>
                      <div>
                        {this.state.formLoading[4] !== false ? (
                          this.state.formLoading[4]
                        ) : (
                          <Button
                            variant="contained"
                            className={classes.button}
                            style={{ marginTop: 15, marginLeft: "5vw" }}
                            onClick={this.GenerateAdminLink}
                          >
                            Generate
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}
                </Zoom>
              </Grid>
            </Grid>
          </div>
        )}
      </React.Fragment>
    );
  }
}

const Profile = withStyles(profilestyle)(ProfileComponent);
export { Profile };
