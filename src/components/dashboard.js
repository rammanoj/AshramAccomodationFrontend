import React from "react";
import { NavBar } from "./elements/nav";
import {
  Grid,
  Button,
  Paper,
  withStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  CircularProgress,
  Checkbox
} from "@material-ui/core";
import { Redirect } from "react-router-dom";
import MomentUtils from "@date-io/moment";
import { DateTimePicker, MuiPickersUtilsProvider } from "material-ui-pickers";
import { getCookie } from "./cookie";
import search from "./../img/search.png";
import { searchRooms } from "./../api";
import { fetchAsynchronous } from "./controllers/fetch";

const SearchStyle = () => ({
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
    },
    "&:disabled": {
      color: "#ffffff",
      background: "#dcdfe5"
    }
  }
});

class DashboardComponent extends React.Component {
  constructor(props) {
    super(props);
    let date = new Date();
    let fromDateString = date.toISOString();
    date.setDate(date.getDate() + 1);

    let toDateString = date.toISOString();

    this.state = {
      isLoggedIn: getCookie("token")[1],
      loading: 1,
      start_date: fromDateString,
      end_date: toDateString,
      message: "",
      disabled: false,
      result: [],
      checked: [],
      bkd: true,
      redirect: false,
      rooms: []
    };
  }

  HandleCheck = i => {
    let check = this.state.checked,
      rooms = this.state.rooms;
    check[i] = !check[i];
    if (check[i] === true) {
      rooms.push(this.state.result[i].room);
    } else {
      let getIndex = rooms.indexOf(this.state.result[i].room);
      if (getIndex > -1) {
        rooms.splice(getIndex, 1);
      }
    }
    this.setState({ checked: check, rooms: rooms });

    // if atleast one of the room is checked, enable the 'book room' button.
    if (check.every(i => i === false)) {
      this.setState({ bkd: true });
    } else {
      this.setState({ bkd: false });
    }
  };

  callback = response => {
    console.log(response.rooms.length === 0);
    if (response.rooms.length === 0) {
      this.setState({
        loading: 3,
        emptyData: true,
        disabled: false,
        rooms: [],
        checked: Array(response["rooms"].length).fill(false)
      });
    } else {
      this.setState({
        checked: Array(response["rooms"].length).fill(false),
        result: response.rooms,
        loading: 3,
        disabled: false,
        emptyData: false,
        rooms: []
      });
    }
  };

  formatToDate = d => {
    if (typeof d === "object") {
      // format the date
      let date = d.format("YYYY/MM/DD hh:mm A");
      return date;
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

  HandleClick = e => {
    let headers = {
      Authorization: "Token " + getCookie("token")[0]
    };
    let data = {
      start_date: this.formatToDate(this.state.start_date),
      end_date: this.formatToDate(this.state.end_date)
    };
    fetchAsynchronous(searchRooms, "POST", data, headers, this.callback);
    this.setState({ loading: 2, disabled: true });
  };

  HandleFromDate = date => {
    let from = new Date(date);
    let to = new Date(this.state.end_date);
    from.setDate(from.getDate() + 1);
    if (from > to) {
      this.setState({
        disabled: true,
        message: "You must reside atleast one day here",
        start_date: date
      });
    } else {
      this.setState({ disabled: false, message: "", start_date: date });
    }
  };

  HandleToDate = date => {
    this.setState({ end_date: date });
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

  redirectToCreate = () => {
    this.setState({ redirect: true });
    console.log(this.state.rooms);
  };

  render = () => {
    let { classes } = this.props;
    let start_date = this.state.start_date;
    let end_date = this.state.end_date;
    if (this.state.redirect === true) {
      if (typeof this.state.end_date === "object") {
        end_date = this.state.end_date.toDate();
        end_date = end_date.toISOString();
      }
      if (typeof this.state.start_date === "object") {
        start_date = this.state.start_date.toDate();
        start_date = start_date.toISOString();
      }

      return (
        <Redirect
          to={{
            pathname: "/roombooking",
            state: {
              start_date: start_date,
              end_date: end_date,
              rooms: this.state.rooms
            }
          }}
        />
      );
    }
    return (
      <MuiPickersUtilsProvider utils={MomentUtils} locale="en">
        <React.Fragment>
          {this.state.isLoggedIn === true ? (
            <NavBar value={0} />
          ) : (
            <NavBar value={false} />
          )}
          <Paper style={{ marginRight: "10vw", marginLeft: "10vw" }}>
            <Grid container spacing={24} style={{ marginTop: "20vh" }}>
              <Grid item md={2} />
              <Grid item md={8}>
                <div
                  style={{
                    textAlign: "center",
                    color: "red",
                    marginTop: 3,
                    marginBottom: 3
                  }}
                >
                  {this.state.message}
                </div>
                <Grid container spacing={24}>
                  <Grid item md={6}>
                    <DateTimePicker
                      fullWidth
                      label="From Date"
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
                  <Grid item md={6}>
                    <DateTimePicker
                      fullWidth
                      label="To Date"
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
                      value={this.state.end_date}
                      onChange={this.HandleToDate}
                      format="YYYY/MM/DD hh:mm A"
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
                </Grid>
              </Grid>
              <Grid item md={2} />
            </Grid>
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Button
                className={classes.button}
                style={{ marginBottom: 5 }}
                onClick={this.HandleClick}
                disabled={this.state.disabled}
              >
                Search
              </Button>
            </div>
          </Paper>
          <br />
          <br />
          <div style={{ textAlign: "center" }}>
            {this.state.loading === 1 ? (
              <img
                src={search}
                style={{ height: 300, widtth: 300 }}
                alt="Search here"
              />
            ) : this.state.loading === 2 ? (
              <CircularProgress />
            ) : (
              <div>
                {this.state.isLoggedIn === true ? (
                  <Button
                    style={{ marginBottom: 10, marginLeft: "60vw" }}
                    disabled={this.state.bkd}
                    onClick={this.redirectToCreate}
                  >
                    Book Room
                  </Button>
                ) : (
                  ""
                )}
                {this.state.emptyData === true ? (
                  <div style={{ textAlign: "center" }}>
                    <h2 style={{ color: "red" }}>
                      No rooms avialable in the given dates.
                    </h2>
                  </div>
                ) : (
                  <Paper
                    style={{
                      marginLeft: "10vw",
                      marginRight: "10vw",
                      overflowX: "auto"
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow key={0}>
                          <TableCell />
                          <TableCell>Room</TableCell>
                          <TableCell>Capacity</TableCell>
                          <TableCell>Block</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {this.state.result.map((obj, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Checkbox
                                checked={this.state.checked[index]}
                                onChange={() => this.HandleCheck(index)}
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>{obj.room}</TableCell>
                            <TableCell>{obj.capacity}</TableCell>
                            <TableCell>{obj.block}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                )}
              </div>
            )}
          </div>
          <br />
          <br />
          <br />
        </React.Fragment>
      </MuiPickersUtilsProvider>
    );
  };
}

const Dashboard = withStyles(SearchStyle)(DashboardComponent);

export { Dashboard };
