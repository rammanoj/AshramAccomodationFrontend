import React from "react";
import {
  Button,
  CircularProgress,
  TableBody,
  Table,
  TableHead,
  TableCell,
  TableRow,
  Paper,
  Fade,
  withStyles,
  Modal,
  TextField,
  Grid
} from "@material-ui/core";
import MomentUtils from "@date-io/moment";
import { MuiPickersUtilsProvider, DateTimePicker } from "material-ui-pickers";
import { Link } from "react-router-dom";
import { NavBar } from "./elements/nav";
import { fetchAsynchronous } from "./controllers/fetch";
import {
  getBookings,
  bookingDelete,
  bookingStatusUpdate,
  bookingUpdate
} from "./../api";
import { getCookie } from "./cookie";

const BookingStyles = () => ({
  row: {
    "&:hover": {
      boxShadow: "0px 0px 10px 2px #888888",
      cursor: "pointer"
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

class Bookings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      loading: true,
      result: [],
      modal: false,
      modalData: [],
      emptyData: false,
      search: "",
      loadingtable: false,
      updateV: 0,
      loadingModal: false,
      message: "",
      updatedproof: ""
    };
  }

  formatDate(date) {
    let d = new Date(date);
    return (
      d.getFullYear() +
      "/" +
      (d.getMonth() + 1) +
      "/" +
      d.getDate() +
      " " +
      d.getHours() +
      ":" +
      d.getMinutes()
    );
  }

  componentDidMount = () => {
    // Fetch the ListView API here.
    fetchAsynchronous(
      getBookings,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.BookingsHandler
    );
  };

  BookingsHandler = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
    } else {
      // Display the bookings
      if (response.results.length === 0) {
        this.setState({ emptyData: true, loading: false });
      } else {
        this.setState({
          loading: false,
          result: response.results
        });
      }
    }
  };

  searchHandler = e => {
    if (e.key === "Enter") {
      let uri = getBookings + "?search=" + this.state.search;
      this.setState({ loadingtable: true });
      fetchAsynchronous(
        uri,
        "GET",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.searchCallback
      );
    }
  };

  searchCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
    } else {
      if (response.results.length === 0) {
        this.setState({ emptyData: true, loadingtable: false });
      } else {
        this.setState({
          result: response.results,
          loadingtable: false,
          emptyData: false
        });
      }
    }
  };

  handleClick = index => {
    let indexData = this.state.result[index];
    let rooms = [];
    let blocks = [];
    for (let i in indexData["rooms"]) {
      rooms.push(indexData["rooms"][i].room_no);
      blocks.push(indexData["rooms"][i]["block"]["name"]);
    }

    rooms = rooms.join(",");
    blocks = [...new Set(blocks)].join(",");

    let data = {
      rooms: rooms,
      blocks: blocks,
      start_date: this.formatDate(indexData["start_date"]),
      end_date: this.formatDate(indexData["end_date"]),
      reference: indexData["reference"],
      user_booked: indexData["booked_by"],
      pk: indexData["pk"],
      checkedin: indexData["checkedin"],
      proof: indexData["proof"],
      check: indexData["upload_new_proof"]
    };
    this.setState({ modalData: data, modal: true });
  };

  handleClose = () => {
    this.setState({ modal: false });
  };

  deleteBookingCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({ loadingModal: false });
    } else {
      let pk = this.state.modalData["pk"];
      let obj = this.state.result.find(obj => obj.id === pk);
      let result = this.state.result;
      result.splice(this.state.result.indexOf(obj), 1);
      this.setState({ result: result, modal: false, loadingModal: false });
    }
    alert(response.message);
  };

  DeleteBooking = () => {
    let { modalData: d } = this.state;
    if (new Date(d.start_date) > new Date()) {
      // API Request to to Cancel the booking
      if (window.confirm("Are you sure to perform the action ??")) {
        this.setState({ loadingModal: true });
        let uri = bookingDelete + d.pk + "/";
        fetchAsynchronous(
          uri,
          "DELETE",
          undefined,
          { Authorization: "Token " + getCookie("token")[0].value },
          this.deleteBookingCallback
        );
      }
    } else {
      alert("The booking can not be cancelled, start date passed by");
    }
  };

  CheckIn = () => {
    let pk = this.state.modalData.pk;
    let obj = this.state.result.find(obj => obj.pk === pk);
    console.log(obj);
    if (new Date(obj.start_date) > new Date()) {
      alert("the user can be checked in only after start datetime");
      return;
    }
    if (obj.checkedin === false && new Date(obj.end_date) >= new Date()) {
      this.setState({ loadingModal: true });
      let uri = bookingStatusUpdate + pk + "/";
      fetchAsynchronous(
        uri,
        "POST",
        undefined,
        { Authorization: "Token " + getCookie("token")[0].value },
        this.checkInCallback
      );
    } else {
      alert("The booking details are not valid to checkIn");
    }
  };

  checkInCallback = response => {
    alert(response.message);
    if (response.error === 0) {
      let md = this.state.modalData;
      let result = this.state.result;
      let obj = result.find(obj => obj.pk === md.pk);
      result[result.indexOf(obj)].checkedin = true;
      this.setState({ loadingModal: false, modal: false, result: result });
    } else {
      this.setState({ loadingModal: false, modal: false });
    }
  };

  HandleFromDate = date => {
    let from = new Date(date);
    let to = new Date(this.state.modalData.end_date);
    let md = this.state.modalData;
    md.start_date = date;
    from.setDate(from.getDate() + 1);
    if (from > to) {
      this.setState({
        disabled: true,
        message: "You must reside atleast one day here",
        modalData: md
      });
    } else {
      this.setState({ disabled: false, message: "", modalData: md });
    }
  };

  HandleToDate = date => {
    let md = this.state.modalData;
    md.end_date = date;
    this.setState({ modalData: md });
    let from = new Date(md.start_date);
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

  handleFile = e => {
    let { files } = e.target;
    this.setState({ updatedproof: files[0] });
  };

  UpdateBooking = () => {
    // Updates a Booking.

    // A booking can be only updated before the start date is passed by
    if (new Date(this.state.modalData.start_date) < new Date()) {
      alert("You can not update the booking after the start date passed by");
    } else {
      let uri = bookingUpdate + this.state.modalData.pk + "/";
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value
      };
      let data = new FormData();
      data.append("proof", this.state.updatedproof);
      data.append(
        "start_date",
        this.formatToDate(this.state.modalData.start_date)
      );
      data.append("end_date", this.formatToDate(this.state.modalData.end_date));

      this.setState({ loadingModal: true });
      fetch(uri, {
        method: "PATCH",
        headers: headers,
        body: data
      })
        .then(response => response.json())
        .then(obj => this.UpdateBookingCallback(obj));
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

  UpdateBookingCallback = response => {
    if (response.error !== 1) {
      if (window.confirm(response.message)) {
        window.location.reload();
      } else {
        window.location.reload();
      }
    } else {
      alert(response.message);
      this.setState({ loadingModal: false });
    }
  };

  render = () => {
    let { classes } = this.props;
    if (!this.state.isLoggedIn) {
      return <h1>Authentication Needed!!</h1>;
    }

    let proof = this.state.updatedproof;
    if (proof !== "") {
      proof = proof["name"];
      if (proof.length >= 15) {
        proof = proof.substr(0, 15) + "...";
      }
    }
    return (
      <MuiPickersUtilsProvider utils={MomentUtils} locale="en">
        <React.Fragment>
          <NavBar value={1} />

          <Modal
            aria-labelledby="loading"
            aria-describedby="loading"
            open={this.state.loadingModal}
          >
            <div style={{ textAlign: "center" }}>
              <CircularProgress style={{ marginTop: "25vh" }} />
            </div>
          </Modal>

          {this.state.loading === true ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress style={{ marginTop: "33vh" }} />
            </div>
          ) : (
            <React.Fragment>
              <Modal
                aria-labelledby="User Booking Detail View"
                aria-describedby="User Booking Detail View"
                open={this.state.modal}
                onClose={this.handleClose}
                style={{
                  marginTop: "20vh",
                  marginLeft: "20vw",
                  marginRight: "20vw"
                }}
              >
                <Paper>
                  <div style={{ textAlign: "center" }}>
                    <h2>Room Booking</h2>
                  </div>
                  <Grid container spacing={24}>
                    <Grid item md={1} />
                    <Grid item md={5}>
                      <TextField
                        fullWidth
                        name="reference"
                        label="Reference"
                        InputProps={{
                          readOnly: true
                        }}
                        helperText="Read only"
                        value={this.state.modalData.reference}
                      />
                    </Grid>
                    <Grid item md={5}>
                      <TextField
                        fullWidth
                        name="block"
                        label="Block"
                        InputProps={{
                          readOnly: true
                        }}
                        helperText="Read only"
                        value={this.state.modalData.blocks}
                      />
                    </Grid>
                    <Grid item md={1} />
                    <Grid item md={1} />
                    <Grid item md={5}>
                      <DateTimePicker
                        fullWidth
                        label="From Date"
                        value={
                          this.state.modalData.length !== 0
                            ? new Date(
                                this.state.modalData.start_date
                              ).toISOString()
                            : new Date().toISOString()
                        }
                        onChange={this.HandleFromDate}
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
                    <Grid item md={5}>
                      <DateTimePicker
                        fullWidth
                        label="To Date"
                        value={
                          this.state.modalData.length !== 0
                            ? new Date(
                                this.state.modalData.end_date
                              ).toISOString()
                            : new Date().toISOString()
                        }
                        onChange={this.HandleToDate}
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
                    <Grid item md={1} />
                    <Grid item md={1} />
                    <Grid item md={5}>
                      <TextField
                        name="rooms"
                        label="Rooms"
                        fullWidth
                        InputProps={{
                          readOnly: true
                        }}
                        helperText="Read only"
                        value={this.state.modalData.rooms}
                      />
                    </Grid>
                    <Grid item md={5}>
                      <TextField
                        name="user_booked"
                        label="User Booked"
                        fullWidth
                        InputProps={{
                          readOnly: true
                        }}
                        helperText="Read only"
                        value={this.state.modalData.user_booked}
                      />
                    </Grid>
                    <Grid item md={1} />
                    {this.state.modalData.check === true ? (
                      <React.Fragment>
                        <br />
                        <Grid item md={4} />
                        <Grid item md={4}>
                          <input
                            accept="pdf/*"
                            style={{ display: "none" }}
                            id="raised-button-file"
                            type="file"
                            onChange={this.handleFile}
                          />
                          <label htmlFor="raised-button-file">
                            <Button component="span" className={classes.button}>
                              update proof
                            </Button>
                            {proof}
                          </label>
                        </Grid>
                        <Grid item md={4} />
                      </React.Fragment>
                    ) : (
                      ""
                    )}
                    <br />
                    <Grid item md={1} />
                    <Grid item md={3}>
                      <a
                        href={this.state.modalData.proof}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Button variant="contained" color="primary">
                          User Proof
                        </Button>
                      </a>
                    </Grid>
                    <Grid item md={2}>
                      <Button variant="contained" onClick={this.UpdateBooking}>
                        Update
                      </Button>
                    </Grid>
                    {getCookie("role")[0].value === "Admin" ? (
                      <Grid item md={3}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.CheckIn}
                          disabled={
                            this.state.modalData.checkedin === true
                              ? true
                              : false
                          }
                        >
                          Checkin user
                        </Button>
                      </Grid>
                    ) : (
                      ""
                    )}
                    <Grid item md={3}>
                      <Button
                        variant="contained"
                        style={{ background: "red", color: "white" }}
                        onClick={this.DeleteBooking}
                      >
                        Cancel Booking
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Modal>

              <React.Fragment>
                <div
                  style={{
                    marginTop: "20vh",
                    marginLeft: "10vw",
                    marginRight: "10vw"
                  }}
                >
                  <Grid container spacing={24}>
                    <Grid item md={6}>
                      <TextField
                        label="Search by reference"
                        onKeyPress={this.searchHandler}
                        type="search"
                        value={this.state.search}
                        onChange={e =>
                          this.setState({ search: e.target.value })
                        }
                        margin="normal"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item md={6}>
                      <Link
                        to="/roombooking"
                        style={{
                          textDecoration: "none",
                          float: "right",
                          marginTop: 30
                        }}
                      >
                        <Button variant="outlined">Book Room</Button>
                      </Link>
                    </Grid>
                  </Grid>

                  {this.state.loadingtable === true ? (
                    <CircularProgress
                      style={{ marginLeft: "40vw", marginTop: "20vh" }}
                    />
                  ) : (
                    <Fade in={true}>
                      {this.state.emptyData === true ? (
                        <div style={{ textAlign: "center" }}>
                          <h2 style={{ marginTop: "10vw", color: "red" }}>
                            You have no bookings avialable
                          </h2>
                        </div>
                      ) : (
                        <Paper style={{ overflowX: "auto" }}>
                          <Table>
                            <TableHead>
                              <TableRow style={{ background: "#3a87f2" }}>
                                <TableCell>
                                  <h3 style={{ color: "white" }}>Reference</h3>
                                </TableCell>
                                <TableCell>
                                  <h3 style={{ color: "white" }}>From Date</h3>
                                </TableCell>
                                <TableCell>
                                  <h3 style={{ color: "white" }}>To Date</h3>
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {this.state.result.map((obj, index) => (
                                <TableRow
                                  key={index}
                                  className={classes.row}
                                  onClick={() => this.handleClick(index)}
                                >
                                  <TableCell>{obj.reference}</TableCell>
                                  <TableCell>
                                    {this.formatDate(obj.start_date)}
                                  </TableCell>
                                  <TableCell>
                                    {this.formatDate(obj.end_date)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Paper>
                      )}
                    </Fade>
                  )}
                </div>
              </React.Fragment>
            </React.Fragment>
          )}
        </React.Fragment>
      </MuiPickersUtilsProvider>
    );
  };
}

export default withStyles(BookingStyles)(Bookings);
