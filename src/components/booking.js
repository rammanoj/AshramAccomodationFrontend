import React from "react";
import { NavBar } from "./elements/nav";
import { getCookie } from "./cookie";
import {
  Paper,
  TextField,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  OutlinedInput,
  withStyles,
  FormControl,
  Button,
  Modal,
  Zoom,
  CircularProgress
} from "@material-ui/core";
import { DateTimePicker, MuiPickersUtilsProvider } from "material-ui-pickers";
import MomentUtils from "@date-io/moment";
import { createBooking } from "./../api";

const styles = () => ({
  label: {
    "&$focusedLabel": {
      color: "#3a87f2"
    }
  },
  focusedLabel: {},
  underline: {},
  button: {
    background: "#3a87f2",
    color: "#ffffff",
    "&:hover": {
      background: "#0068f9"
    }
  },
  modal: {
    marginTop: "4vh",
    marginLeft: "10vw",
    marginRight: "10vw"
  }
});

class Booking extends React.Component {
  constructor(props) {
    super(props);
    let check = false,
      tomorrow;
    if (props.location.state !== undefined) {
      check = true;
    } else {
      tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
    }
    let user_type = getCookie("role")[0].value,
      check_values = [];
    check_values = ["start_date", "end_date", "booking_type", "proof"];
    if (check === true) {
      check_values.push("rooms");
    } else {
      check_values.push("persons");
    }
    this.state = {
      isLoggedIn: getCookie("token")[1],
      check: check,
      rooms: check === true ? props.location.state.rooms.join(",") : "",
      persons: "",
      start_date:
        check === true
          ? props.location.state.start_date
          : new Date().toISOString(),
      end_date:
        check === true ? props.location.state.end_date : tomorrow.toISOString(),
      booking_type: user_type !== "Admin" ? "Online" : "",
      user_booked: "",
      message: "",
      disabled: true,
      disable_values: check_values,
      book_room: false,
      proof: "",
      loading: false,
      payment: [false, false, false, false, false, false]
    };
  }

  paymentChange = e => {
    let { name } = e.target;
    let payment = [false, false, false, false, false, false];
    payment[parseInt(name)] = true;
    this.setState({ payment: payment });
  };

  handleChange = e => {
    let { name, value } = e.target;
    let l = this.state.disable_values;
    if (name === "booking_type" && value === "Offline") {
      if (l.indexOf("user_booked") === -1) {
        l.push("user_booked");
      }
    } else {
      if (l.indexOf("user_booked") > -1) {
        l.splice(l.indexOf("user_booked"), 1);
      }
    }
    this.setState({ [name]: value, disable_values: l }, () =>
      this.checkDisbale(l)
    );
  };

  checkDisbale = disable_values => {
    let disable = false;
    for (let i in disable_values) {
      if (this.state[disable_values[i]] === "") {
        disable = true;
        break;
      }
    }
    if (disable === true) {
      this.setState({ disabled: disable });
    } else {
      if (this.state.message === "") {
        this.setState({ disabled: false });
      }
    }
  };

  HandleFromDate = date => {
    let from = new Date(date);
    let to = new Date(this.state.end_date);
    from.setDate(from.getDate() + 1);
    if (from > to) {
      this.setState(
        {
          disabled: true,
          message: "You must reside atleast one day here",
          start_date: date
        },
        () => this.checkDisbale(this.state.disable_values)
      );
    } else {
      this.setState({ disabled: false, message: "", start_date: date });
    }
  };

  callback = response => {
    // handle the response to the API fetch
    this.setState({ loading: false });
    if (response.error === 0) {
      // make an animation of the success in creating the room
      if (window.confirm(response.message)) {
        window.location = "http://localhost:3000/bookings";
      } else {
        window.location = "http://localhost:3000/bookings";
      }
    } else {
      this.setState({ book_room: false, message: response.message });
    }
  };

  formatToDate = d => {
    if (typeof d === "object") {
      // format the date
      return d.format("YYYY/MM/DD hh:mm A");
    } else {
      let date = new Date(d);
      let hours = date.getHours(),
        ampm = "AM";
      if (date.getHours() > 12) {
        hours = date.getHours() - 12;
        ampm = "PM";
      }
      return (
        date.getFullYear() +
        "/" +
        (date.getMonth() + 1) +
        "/" +
        date.getDate() +
        " " +
        hours +
        ":" +
        date.getMinutes() +
        " " +
        ampm
      );
    }
  };

  HandleAPIfetch = () => {
    // Fetches the API and process a room booking.
    var data = new FormData(),
      rooms;
    if (this.state.rooms !== "") {
      rooms = this.state.rooms.split(",");
    }
    this.setState({ loading: true });
    for (let i in rooms) {
      data.append("rooms[]", rooms[i]);
    }
    data.append("members", this.state.persons);
    data.append("start_date", this.formatToDate(this.state.start_date));
    data.append("end_date", this.formatToDate(this.state.end_date));
    data.append("booking_type", this.state.booking_type);
    data.append("user_booked", this.state.user_booked);
    data.append("proof", this.state.proof);

    let headers = {
      Authorization: "Token " + getCookie("token")[0].value
    };
    fetch(createBooking, {
      method: "POST",
      body: data,
      headers: headers
    })
      .then(response => response.json())
      .then(object => this.callback(object));
  };

  HandleToDate = date => {
    this.setState({ end_date: date }, () =>
      this.checkDisbale(this.state.disable_values)
    );
    let from = new Date(this.state.start_date);
    let to = new Date(date);
    from.setDate(from.getDate() + 1);
    if (from > to) {
      this.setState({
        disabled: true,
        message: "You must reside atleast one day here"
      });
    } else {
      this.setState({ disabled: false, message: "" });
    }
  };

  closeM = () => {
    this.setState({ book_room: false });
  };

  handleFile = e => {
    let { files } = e.target;
    let l = this.state.disable_values;
    l[3] = true;
    this.setState({ proof: files[0], disable_values: l }, () => {
      this.checkDisbale(l);
    });
  };

  render = () => {
    if (!this.state.isLoggedIn) {
      return <h1>Needed Authentication</h1>;
    }
    let { classes } = this.props;
    let proof = this.state.proof;
    if (proof !== "") {
      proof = proof["name"];
      if (proof.length >= 15) {
        proof = proof.substr(0, 15) + "...";
      }
    }
    return (
      <MuiPickersUtilsProvider utils={MomentUtils} locale="en">
        <React.Fragment>
          <NavBar value={false} />

          <Modal
            aria-labelledby="loading"
            aria-describedby="loading"
            open={this.state.loading}
          >
            <div style={{ textAlign: "center" }}>
              <CircularProgress style={{ marginTop: "25vh" }} />
            </div>
          </Modal>
          <div
            style={{
              marginTop: "20vh",
              marginLeft: "30vw",
              marginRight: "30vw"
            }}
          >
            <Modal
              aria-labelledby="payment"
              aria-describedby="payment"
              open={this.state.book_room}
              onClose={this.closeM}
              className={classes.modal}
            >
              <div>
                <Zoom in={true}>
                  <Paper>
                    <Grid container spacing={24}>
                      <Grid item md={2} />
                      <Grid item md={10}>
                        <div className="paymentCont">
                          <div className="headingWrap">
                            <h3 className="headingTop text-center">
                              You need to pay to proceed further
                            </h3>
                            <p className="text-center">
                              Select your payment method
                            </p>
                          </div>
                          <div className="paymentWrap">
                            <div
                              className="btn-group paymentBtnGroup btn-group-justified"
                              data-toggle="buttons"
                            >
                              <label
                                onClick={this.paymentChange}
                                className="btn paymentMethod"
                                style={
                                  this.state.payment[0] === true
                                    ? {
                                        borderColor: "#4cd264",
                                        outline: "none !important",
                                        boxShadow: "0px 3px 22px 0px #7b7b7b"
                                      }
                                    : {}
                                }
                              >
                                <div className="method visa" />
                                <input
                                  type="radio"
                                  name="0"
                                  value={this.state.payment[0]}
                                  onChange={() => console.log("handle click")}
                                />
                              </label>
                              <label
                                onClick={this.paymentChange}
                                className="btn paymentMethod"
                                style={
                                  this.state.payment[1] === true
                                    ? {
                                        borderColor: "#4cd264",
                                        outline: "none !important",
                                        boxShadow: "0px 3px 22px 0px #7b7b7b"
                                      }
                                    : {}
                                }
                              >
                                <div className="method master-card" />
                                <input
                                  type="radio"
                                  name="1"
                                  value={this.state.payment[1]}
                                  onChange={() => console.log("handle click")}
                                />
                              </label>
                              <label
                                onClick={this.paymentChange}
                                className="btn paymentMethod"
                                style={
                                  this.state.payment[2] === true
                                    ? {
                                        borderColor: "#4cd264",
                                        outline: "none !important",
                                        boxShadow: "0px 3px 22px 0px #7b7b7b"
                                      }
                                    : {}
                                }
                              >
                                <div className="method amex" />
                                <input
                                  type="radio"
                                  onChange={() => console.log("handle click")}
                                  name="2"
                                  value={this.state.payment[2]}
                                />
                              </label>
                              <label
                                className="btn paymentMethod"
                                style={
                                  this.state.payment[3] === true
                                    ? {
                                        borderColor: "#4cd264",
                                        outline: "none !important",
                                        boxShadow: "0px 3px 22px 0px #7b7b7b"
                                      }
                                    : {}
                                }
                                onClick={this.paymentChange}
                              >
                                <div className="method vishwa" />
                                <input
                                  type="radio"
                                  onChange={() => console.log("handle click")}
                                  name="3"
                                  checked={this.state.payment[3]}
                                />
                              </label>
                              <label
                                onClick={this.paymentChange}
                                className="btn paymentMethod"
                                style={
                                  this.state.payment[4] === true
                                    ? {
                                        borderColor: "#4cd264",
                                        outline: "none !important",
                                        boxShadow: "0px 3px 22px 0px #7b7b7b"
                                      }
                                    : {}
                                }
                              >
                                <div className="method ez-cash" />
                                <input
                                  type="radio"
                                  name="4"
                                  onChange={() => console.log("handle click")}
                                  checked={this.state.payment[4]}
                                />
                              </label>
                              {getCookie("role")[0].value === "Admin" ? (
                                <label
                                  onClick={this.paymentChange}
                                  className="btn paymentMethod"
                                  style={
                                    this.state.payment[5] === true
                                      ? {
                                          borderColor: "#4cd264",
                                          outline: "none !important",
                                          boxShadow: "0px 3px 22px 0px #7b7b7b"
                                        }
                                      : {}
                                  }
                                >
                                  <div className="method handcash" />
                                  <input
                                    type="radio"
                                    name="5"
                                    onChange={() => console.log("handle click")}
                                    value={this.state.payment[5]}
                                  />
                                </label>
                              ) : (
                                ""
                              )}
                            </div>
                          </div>
                          <div className="footerNavWrap clearfix">
                            <Button
                              variant="contained"
                              style={{ color: "white", background: "#65f442" }}
                              onClick={this.HandleAPIfetch}
                            >
                              Proceed
                            </Button>
                          </div>
                        </div>
                      </Grid>
                    </Grid>
                  </Paper>
                </Zoom>
              </div>
            </Modal>
            <Paper>
              <div style={{ textAlign: "center" }}>
                <h1>Book Room</h1>
                <p style={{ marginBottom: 10, color: "red" }}>
                  {this.state.message}
                </p>
              </div>
              <Grid container spacing={24}>
                {this.state.check === true ? (
                  <React.Fragment>
                    <Grid item md={2} />
                    <Grid item md={8}>
                      <TextField
                        fullWidth
                        label="Rooms"
                        name="rooms"
                        value={this.state.rooms}
                        onClick={this.handleChange}
                        disabled
                        variant="outlined"
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
                    <Grid item md={2} />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Grid item md={2} />
                    <Grid item md={8}>
                      <TextField
                        fullWidth
                        label="Members"
                        name="persons"
                        value={this.state.persons}
                        onChange={this.handleChange}
                        variant="outlined"
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
                    <Grid item md={2} />
                  </React.Fragment>
                )}
                <Grid item md={2} />
                <Grid item md={8}>
                  <DateTimePicker
                    fullWidth
                    label="From Date"
                    variant="outlined"
                    value={this.state.start_date}
                    onChange={this.HandleFromDate}
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
                    format={"YYYY/MM/DD hh:mm A"}
                    mask={[
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/,
                      "/",
                      /\d/,
                      /\d/,
                      "/",
                      /\d/,
                      /\d/,
                      " ",
                      /\d/,
                      /\d/,
                      ":",
                      /\d/,
                      /\d/,
                      " ",
                      /a|p/i,
                      "M"
                    ]}
                  />
                </Grid>
                <Grid item md={2} />
                <Grid item md={2} />
                <Grid item md={8}>
                  <DateTimePicker
                    fullWidth
                    label="To Date"
                    variant="outlined"
                    value={this.state.end_date}
                    onChange={this.HandleToDate}
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
                    format={"YYYY/MM/DD hh:mm A"}
                    mask={[
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/,
                      "/",
                      /\d/,
                      /\d/,
                      "/",
                      /\d/,
                      /\d/,
                      " ",
                      /\d/,
                      /\d/,
                      ":",
                      /\d/,
                      /\d/,
                      " ",
                      /a|p/i,
                      "M"
                    ]}
                  />
                </Grid>
                <Grid item md={2} />

                {/* For Admin */}
                {getCookie("role")[0].value === "Admin" ? (
                  <React.Fragment>
                    <React.Fragment>
                      <Grid item md={2} />
                      <Grid item md={8}>
                        <FormControl variant="outlined" fullWidth>
                          <InputLabel htmlFor="select">Booking Type</InputLabel>
                          <Select
                            name="booking_type"
                            value={this.state.booking_type}
                            onChange={this.handleChange}
                            input={
                              <OutlinedInput
                                labelWidth={98}
                                name="booking_type"
                                id="select"
                              />
                            }
                          >
                            <MenuItem value={"Online"}>Online Booking</MenuItem>
                            <MenuItem value={"Offline"}>
                              Offline Booking
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item md={2} />
                    </React.Fragment>
                    <React.Fragment>
                      <Grid item md={2} />
                      <Grid item md={8}>
                        <TextField
                          fullWidth
                          label="User Booked"
                          name="user_booked"
                          disabled={
                            this.state.booking_type === "Offline" ? false : true
                          }
                          value={this.state.user_booked}
                          onChange={this.handleChange}
                          variant="outlined"
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
                      <Grid item md={2} />
                    </React.Fragment>
                  </React.Fragment>
                ) : (
                  ""
                )}
                <React.Fragment>
                  <Grid item md={2} />
                  <Grid item md={8}>
                    <input
                      accept="pdf/*"
                      style={{ display: "none" }}
                      id="raised-button-file"
                      type="file"
                      onChange={this.handleFile}
                    />
                    <label htmlFor="raised-button-file">
                      <Button component="span" className={classes.button}>
                        Proof for booking
                      </Button>
                      {proof}
                    </label>
                  </Grid>
                  <Grid item md={2} />
                </React.Fragment>
                <React.Fragment>
                  <Grid item md={2} />
                  <Grid item md={8}>
                    <Button
                      variant="contained"
                      className={classes.button}
                      disabled={this.state.disabled}
                      onClick={() => this.setState({ book_room: true })}
                      style={{ width: "100%" }}
                    >
                      Book Room
                    </Button>
                  </Grid>
                  <Grid item md={2} />
                </React.Fragment>
              </Grid>
            </Paper>
          </div>
        </React.Fragment>
      </MuiPickersUtilsProvider>
    );
  };
}

export default withStyles(styles)(Booking);
