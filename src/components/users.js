import React from "react";
import { NavBar } from "./elements/nav";
import { getCookie } from "./cookie";
import { userListView, userAccess } from "./../api";
import { DMenu as Menu } from "./elements/menu";
import { fetchAsynchronous } from "./controllers/fetch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
  Fade,
  withStyles,
  CircularProgress,
  Paper,
  TextField,
  Modal
} from "@material-ui/core";

const styles = () => ({
  row: {
    "&:hover": {
      boxShadow: "0px 0px 10px 2px #888888",
      cursor: "pointer"
    }
  }
});

class Users extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permitted: getCookie("role")[0].value === "Admin",
      isLoggedIn: getCookie("user")[1],
      searchBy: "",
      moreClick: false,
      loading: true,
      response: "",
      result: "",
      loadingModal: false,
      updatedV: "",
      search: "",
      loadingtable: false
    };
  }

  searchCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
    } else {
      let table;
      if (response.results.length === 0) {
        table = (
          <h1 style={{ marginTop: "2vh", color: "red" }}>
            No user found as per given requirement
          </h1>
        );
      } else {
        for (let i in response.results) {
          if (response.results[i].disabled === true) {
            response.results[i].color = "rgb(229, 139, 139)";
          } else {
            response.results[i].color = "#ffffff";
          }
        }
        table = this.constructList(response.results);
      }
      this.setState({
        response: table,
        result: response.results,
        loadingtable: false
      });
    }
  };

  searchHandler = e => {
    if (e.key === "Enter") {
      let uri = userListView + "?search=" + this.state.search;
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

  componentDidMount = () => {
    // Fetch the details from the server.
    fetchAsynchronous(
      userListView,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.ListHandler
    );
  };

  callback = response => {
    if (response.error === 0) {
      let res = this.state.result;
      res[this.state.updatedV].disabled = !res[this.state.updatedV].disabled;

      if (res[this.state.updatedV].disabled === true) {
        res[this.state.updatedV].color = "rgb(229, 139, 139)";
      } else {
        res[this.state.updatedV].color = "#ffffff";
      }
      // Update the HTML content
      let resp = this.constructList(res);
      this.setState(
        { result: res, loadingModal: false, updatedV: "", response: resp },
        () => alert(response.message)
      );
    } else {
      // error occured
      this.setState({ loadingModal: false, updatedV: "" }, () =>
        alert(response.message)
      );
    }
  };

  HandleMenuClick = id => {
    let message = "Confirm Disable User";
    if (this.state.result[id].disabled === true) {
      message = "Confirm Enable user";
    }
    let confirmation = window.confirm(message);
    if (confirmation === true) {
      this.setState({ loadingModal: true, updatedV: id });
      let uri = userAccess + this.state.result[id].pk + "/";
      fetchAsynchronous(
        uri,
        "POST",
        { disable: !this.state.result[id].disabled },
        {
          Authorization: "Token " + getCookie("token")[0].value,
          "Content-Type": "application/json"
        },
        this.callback
      );
    }
  };

  constructList = result => {
    let { classes } = this.props;
    let tableHeader = (
      <TableHead>
        <TableRow style={{ background: "#3a87f2" }}>
          <TableCell>
            <h3 style={{ color: "white" }}>Username</h3>
          </TableCell>
          <TableCell>
            <h3 style={{ color: "white" }}>Email</h3>
          </TableCell>
          <TableCell>
            <h3 style={{ color: "white" }}>Mobile</h3>
          </TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
    );
    let tableBody = [];
    for (let i in result) {
      let style = {},
        state = "Disable";
      if (result[i].disabled === true) {
        style = { background: result[i].color };
        state = "Enable";
      }
      tableBody.push(
        <TableRow key={i} className={classes.row} style={style}>
          <TableCell>{result[i].username}</TableCell>
          <TableCell>{result[i].email}</TableCell>
          <TableCell>{result[i].mobile}</TableCell>
          <TableCell>
            <Menu
              label={"users"}
              body={[state]}
              id={i}
              HandleMenuClick={this.HandleMenuClick}
              iconType="more"
            />
          </TableCell>
        </TableRow>
      );
    }
    let table = (
      <Paper style={{ overflowX: "auto" }}>
        <Table>
          {tableHeader}
          <TableBody>{tableBody}</TableBody>
        </Table>
      </Paper>
    );

    return table;
  };

  ListHandler = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
    } else {
      // Display the bookings
      if (response.results.length === 0) {
        let response = (
          <div style={{ textAlign: "center" }}>
            <h2 style={{ marginTop: "10vw" }}>
              You have no bookings avialable
            </h2>
          </div>
        );
        this.setState({ response: response, loading: false });
      } else {
        for (let i in response.results) {
          if (response.results[i].disabled === true) {
            response.results[i].color = "rgb(229, 139, 139)";
          } else {
            response.results[i].color = "white";
          }
        }
        this.setState({ result: response.results }, () => {
          let response = this.constructList(this.state.result);
          this.setState({
            loading: false,
            response: response
          });
        });
      }
    }
  };

  render() {
    if (!this.state.permitted || !this.state.isLoggedIn) {
      return <h1>Permission Denied</h1>;
    }
    return (
      <React.Fragment>
        <NavBar value={3} />
        <React.Fragment>
          {this.state.loading === true ? (
            <CircularProgress
              style={{ marginLeft: "45vw", marginTop: "40vh" }}
            />
          ) : (
            <React.Fragment>
              <Modal
                open={this.state.loadingModal}
                disableAutoFocus={true}
                disableEnforceFocus={true}
              >
                <CircularProgress
                  style={{ marginLeft: "45vw", marginTop: "40vh" }}
                />
              </Modal>
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
                      label="Search by Username"
                      type="search"
                      value={this.state.search}
                      onChange={e => {
                        this.setState({ search: e.target.value });
                      }}
                      onKeyPress={this.searchHandler}
                      margin="normal"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item md={6} />
                </Grid>
                {this.state.loadingtable === true ? (
                  <CircularProgress
                    style={{ marginLeft: "40vw", marginTop: "20vh" }}
                  />
                ) : (
                  <Fade in={true}>{this.state.response}</Fade>
                )}
              </div>

              <br />
              <br />
              <br />
            </React.Fragment>
          )}
        </React.Fragment>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Users);
