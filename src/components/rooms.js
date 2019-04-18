import React from "react";
import { NavBar } from "./elements/nav";
import { getCookie } from "./cookie";
import {
  roomListView,
  roomDelete,
  blockUnblockRoom,
  blockListCreateDelete,
  roomCreateView
} from "./../api";
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
  Modal,
  Checkbox,
  Button,
  FormControl,
  MenuItem,
  InputLabel,
  Select
} from "@material-ui/core";

const styles = () => ({
  row: {
    "&:hover": {
      boxShadow: "0px 0px 10px 2px #888888",
      cursor: "pointer"
    }
  }
});

class Rooms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      permitted: getCookie("role")[0].value === "Admin",
      isLoggedIn: getCookie("user")[1],
      searchBy: "",
      loading: true,
      result: "",
      loadingModal: false,
      updatedV: "",
      search: "",
      loadingtable: false,
      disabled: true,
      check: [],
      rooms: [],
      emptyresult: false,
      addroom: false
    };
  }

  componentDidMount = () => {
    // Fetch the details from the server.
    fetchAsynchronous(
      roomListView,
      "GET",
      undefined,
      { Authorization: "Token " + getCookie("token")[0].value },
      this.ListHandler
    );
  };

  ListHandler = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
    } else {
      // Display the bookings
      let check = Array(response.results.length).fill(false);
      if (response.results.length === 0) {
        this.setState({ emptyresult: true, loading: false });
      } else {
        this.setState({
          result: response.results,
          check: check,
          loading: false
        });
      }
    }
  };

  searchHandler = e => {
    if (e.key === "Enter") {
      let uri = roomListView + "?search=" + this.state.search;
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
        this.setState({ emptyresult: true, loadingtable: false });
      } else {
        this.setState({
          result: response.results,
          loadingtable: false,
          emptyresult: false
        });
      }
    }
  };

  HandleCheck = i => {
    let check = this.state.check,
      rooms = this.state.rooms;
    check[i] = !check[i];
    if (check[i] === true) {
      rooms.push(this.state.result[i].room_no);
    } else {
      let getIndex = rooms.indexOf(this.state.result[i].room_no);
      if (getIndex > -1) {
        rooms.splice(getIndex, 1);
      }
    }
    this.setState({ check: check, rooms: rooms });

    // if atleast one of the room is checked, enable the 'book room' button.
    if (check.every(i => i === false)) {
      this.setState({ disabled: true });
    } else {
      this.setState({ disabled: false });
    }
  };

  deleteRoom = () => {
    /*
     * API Request to  DELETE a Room
     */
    let confirmation = window.confirm("Are you sure to delete the Rooms ?");
    if (confirmation === true) {
      // Send a delete request to the server.
      let data = {
        rooms: this.state.rooms
      };
      this.setState({ loadingModal: true });
      fetchAsynchronous(
        roomDelete,
        "DELETE",
        data,
        {
          Authorization: "Token " + getCookie("token")[0].value,
          "Content-Type": "application/json"
        },
        this.roomDeleteCallback
      );
    }
  };

  roomDeleteCallback = response => {
    /*
     * Response handler to the DELETE API Request.
     */
    if (response.error !== 1) {
      let result = this.state.result;

      for (let item in this.state.rooms) {
        let objDel = result.find(function(obj) {
          return item === obj.room_no;
        });
        result.splice(result.indexOf(objDel), 1);
      }
      this.setState({
        result: result,
        rooms: [],
        loadingModal: false,
        disabled: true,
        check: Array(result.length).fill(false)
      });
    } else {
      this.setState({ loadingModal: false });
    }
    alert(response.message);
  };

  blockorUnblock = () => {
    /*
     * API Request to BLOCK or UNBLOCK the Rooms.
     */
    let confirmation = window.confirm("Are you sure about the operation ?");
    if (confirmation === true) {
      let data = {
        rooms: this.state.rooms
      };
      this.setState({ loadingModal: true });
      fetchAsynchronous(
        blockUnblockRoom,
        "POST",
        data,
        {
          Authorization: "Token " + getCookie("token")[0].value,
          "Content-Type": "application/json"
        },
        this.roomcallback
      );
    }
  };

  callback = response => {
    if (response.error === 0) {
      let res = this.state.result;
      res[this.state.updatedV].disabled = !res[this.state.updatedV].disabled;

      this.setState({ result: res, loadingModal: false, updatedV: "" }, () =>
        alert(response.message)
      );
    } else {
      // error occured
      this.setState({ loadingModal: false, updatedV: "" }, () =>
        alert(response.message)
      );
    }
  };

  roomcallback = response => {
    /*
     * Response handler to BLOCK or UNBLOCK Rooms API Request.
     */
    if (response.error === 0) {
      let result = this.state.result;
      for (let i in this.state.rooms) {
        let obj = result.find(obj => this.state.rooms[i] === obj.room_no);
        result[result.indexOf(obj)].blocked = !result[result.indexOf(obj)]
          .blocked;
      }

      this.setState({
        result: result,
        check: Array(result.length).fill(false),
        rooms: [],
        loadingModal: false
      });
    } else {
      this.setState({ loadingModal: false });
    }
    alert(response.message);
  };

  render() {
    if (!this.state.permitted || !this.state.isLoggedIn) {
      return <h1>Permission Denied</h1>;
    }
    let { classes } = this.props;
    return (
      <React.Fragment>
        <NavBar value={2} />
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
                <Modal
                  open={this.state.addroom}
                  disableAutoFocus={true}
                  disableEnforceFocus={true}
                  onClose={() => this.setState({ addroom: false })}
                  style={{
                    marginTop: "10vh",
                    marginLeft: "30vw",
                    marginRight: "30vw"
                  }}
                >
                  <Paper>
                    <AddRoom />
                  </Paper>
                </Modal>
                <Grid container spacing={24}>
                  <Grid item md={4}>
                    <TextField
                      label="Search by Room no."
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
                  <Grid
                    item
                    md={2}
                    style={{
                      textDecoration: "none",
                      marginTop: 30
                    }}
                  >
                    <Button onClick={() => this.setState({ addroom: true })}>
                      Add Room
                    </Button>
                  </Grid>

                  <Grid
                    item
                    md={2}
                    style={{
                      textDecoration: "none",
                      marginTop: 30
                    }}
                  >
                    <Button
                      disabled={this.state.disabled}
                      onClick={this.deleteRoom}
                    >
                      Delete Room
                    </Button>
                  </Grid>

                  <Grid
                    item
                    md={2}
                    style={{
                      textDecoration: "none",
                      marginTop: 30
                    }}
                  >
                    <Button
                      disabled={this.state.disabled}
                      onClick={this.blockorUnblock}
                    >
                      Block/UnBlock Room
                    </Button>
                  </Grid>

                  <Grid item md={2} />
                </Grid>
                {this.state.loadingtable === true ? (
                  <CircularProgress
                    style={{ marginLeft: "40vw", marginTop: "20vh" }}
                  />
                ) : (
                  <Fade in={true}>
                    {/* this is the place where the components has to fit  emptyresult */}
                    {this.state.emptyresult === true ? (
                      <h1 style={{ marginTop: "2vh", color: "red" }}>
                        No room found as per given requirement
                      </h1>
                    ) : (
                      <Paper style={{ overflowX: "auto" }}>
                        <Table>
                          <TableHead>
                            <TableRow style={{ background: "#3a87f2" }}>
                              <TableCell />
                              <TableCell>
                                <h3 style={{ color: "white" }}>Room no.</h3>
                              </TableCell>
                              <TableCell>
                                <h3 style={{ color: "white" }}>Capacity</h3>
                              </TableCell>
                              <TableCell>
                                <h3 style={{ color: "white" }}>Block</h3>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {this.state.result.map((obj, index) => (
                              <TableRow
                                key={index}
                                className={classes.row}
                                style={
                                  obj.blocked === true
                                    ? { background: "#c1f2d1" }
                                    : { background: "#ffffff" }
                                }
                              >
                                <TableCell>
                                  {obj.blocked === false &&
                                  obj.avialable === false ? (
                                    <Checkbox
                                      disabled={true}
                                      name="check"
                                      color="primary"
                                      checked={this.state.check[index]}
                                      onChange={() => this.HandleCheck(index)}
                                    />
                                  ) : (
                                    <Checkbox
                                      name="check"
                                      color="primary"
                                      checked={this.state.check[index]}
                                      onChange={() => this.HandleCheck(index)}
                                    />
                                  )}
                                </TableCell>
                                <TableCell>{obj.room_no}</TableCell>
                                <TableCell>{obj.capacity}</TableCell>
                                <TableCell>{obj.block.name}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    )}
                  </Fade>
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

class AddRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      blocks: [],
      room_no: "",
      floor: "",
      capacity: "",
      block: "",
      new_block: "",
      message: "",
      formLoading: false,
      color: ""
    };
  }

  componentDidMount = () => {
    // Fetch the API and get the details of the blocks.
    fetchAsynchronous(
      blockListCreateDelete,
      "GET",
      undefined,
      {
        Authorization: "Token " + getCookie("token")[0].value
      },
      this.blocksCallback
    );
  };

  blocksCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      alert(response.message);
    } else {
      this.setState({ blocks: response.results, loading: false });
    }
  };

  handleChange = e => {
    let { name, value } = e.target;

    if (name === "new_block") {
      if (this.state.block !== "") {
        alert(
          "you can either choose a block, or create new one. Can't do both at same time"
        );
      } else {
        this.setState({ new_block: value });
      }
    } else {
      this.setState({ [name]: value });
    }
  };

  CreateRoomRequest = () => {
    // If a new block is filled, then create a new block
    this.setState({ formLoading: true });
    if (this.state.new_block !== "" && this.state.block === "") {
      fetchAsynchronous(
        blockListCreateDelete,
        "POST",
        { name: this.state.new_block },
        {
          Authorization: "Token " + getCookie("token")[0].value,
          "Content-Type": "application/json"
        },
        this.callback
      );
    } else {
      let data = {
        avialable: true,
        room_no: this.state.room_no,
        floor: this.state.floor,
        capacity: this.state.capacity,
        block: this.state.block
      };
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value,
        "Content-Type": "application/json"
      };
      fetchAsynchronous(
        roomCreateView,
        "POST",
        data,
        headers,
        this.CreateRoomCallback
      );
    }
  };

  callback = response => {
    let data = {
      avialable: true,
      room_no: this.state.room_no,
      floor: this.state.floor,
      capacity: this.state.capacity,
      block: response.pk
    };
    let headers = {
      Authorization: "Token " + getCookie("token")[0].value,
      "Content-Type": "application/json"
    };
    fetchAsynchronous(
      roomCreateView,
      "POST",
      data,
      headers,
      this.CreateRoomCallback
    );
  };

  CreateRoomCallback = response => {
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({
        message: response.message,
        formLoading: false,
        color: "red"
      });
    } else {
      this.setState({
        message: response.message,
        formLoading: false,
        color: "green"
      });
    }
  };

  render = () => {
    return (
      <React.Fragment>
        {this.state.loading === true ? (
          <div style={{ textAlign: "center" }}>
            <CircularProgress
              style={{ marginTop: "5vw", marginBottom: "5vw" }}
            />
          </div>
        ) : (
          <React.Fragment>
            <div style={{ textAlign: "center" }}>
              <h1>Create Room</h1>
            </div>
            <Grid container spacing={24}>
              <React.Fragment>
                <Grid item md={2} />
                <Grid item md={8}>
                  <p style={{ color: this.state.color }}>
                    {" "}
                    {this.state.message}
                  </p>
                </Grid>
                <Grid item md={2} />
              </React.Fragment>
              <React.Fragment>
                <Grid item md={2} />
                <Grid item md={8}>
                  <TextField
                    fullWidth
                    name="room_no"
                    value={this.state.room_no}
                    onChange={this.handleChange}
                    label="Room number"
                  />
                </Grid>
                <Grid item md={2} />
              </React.Fragment>
              <React.Fragment>
                <Grid item md={1} />
                <Grid item md={5}>
                  <TextField
                    fullWidth
                    name="floor"
                    type="number"
                    value={this.state.floor}
                    onChange={this.handleChange}
                    label="Floor"
                  />
                </Grid>
                <Grid item md={5}>
                  <TextField
                    fullWidth
                    name="capacity"
                    type="number"
                    value={this.state.capacity}
                    onChange={this.handleChange}
                    label="Max. Capacity"
                  />
                </Grid>
                <Grid item md={1} />
              </React.Fragment>
              <React.Fragment>
                <Grid item md={2} />
                <Grid item md={8}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="select">Blocks</InputLabel>
                    <Select
                      value={this.state.block}
                      name="block"
                      id="select"
                      onChange={this.handleChange}
                    >
                      {" "}
                      {this.state.blocks.map((obj, index) => (
                        <MenuItem value={obj.pk} key={obj.pk}>
                          {obj.name}
                        </MenuItem>
                      ))}
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
                    name="new_block"
                    value={this.state.new_block}
                    onChange={this.handleChange}
                    label="new block"
                    disabled={this.state.block !== "" ? true : false}
                  />
                </Grid>
                <Grid item md={2} />
              </React.Fragment>
              <React.Fragment>
                <Grid item md={2} />
                <Grid item md={8}>
                  {this.state.formLoading === true ? (
                    <div style={{ textAlign: "center" }}>
                      <CircularProgress />
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.CreateRoomRequest}
                      fullWidth
                    >
                      Create
                    </Button>
                  )}
                </Grid>
                <Grid item md={2} />
              </React.Fragment>
            </Grid>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  };
}

export default withStyles(styles)(Rooms);
