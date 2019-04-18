import React from "react";
import { getCookie } from "./../cookie";
import { Link } from "react-router-dom";
import {
  AppBar,
  Typography,
  Tabs,
  Tab,
  Grid,
  MenuItem,
  IconButton,
  Menu,
  CssBaseline,
  withStyles
} from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import loader from "./../../img/loading.gif";

const NavStyles = () => ({
  indicate: { backgroundColor: "#3a87f2" }
});

const NavStyle = {
  backgroundColor: "#ffffff",
  paddingTop: 5
};

class PaginateLoading extends React.Component {
  render = classname => (
    <div className={classname}>
      <div className="loader">
        <svg className="circular" viewBox="25 25 50 50">
          <circle
            className="path"
            cx="50"
            cy="50"
            r="20"
            fill="none"
            strokeWidth="3"
            strokeMiterlimit="10"
          />
        </svg>
      </div>
    </div>
  );
}

class NavBarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: getCookie("token")[1],
      value: this.props.value,
      profile: null
    };
  }

  HandleTabClick = (e, v) => {
    this.setState({ value: v });
  };

  handleClick = e => {
    this.setState({ profile: e.currentTarget });
  };

  HandleProfileClose = e => {
    this.setState({ profile: null });
  };

  render = () => {
    let { classes } = this.props;
    let component;
    if (this.state.isLoggedIn) {
      let role = getCookie("role")[0].value;
      console.log(role);
      if (role === "Devotee") {
        role = false;
      } else {
        role = true;
      }
      let open = Boolean(this.state.profile);

      component = (
        <React.Fragment>
          <CssBaseline />
          <Grid container spacing={40} justify="flex-start">
            <Grid item md={1}>
              <Typography
                variant="headline"
                style={{ marginLeft: 10, marginTop: 10 }}
              >
                AABS
              </Typography>
            </Grid>
            <Grid item md={7}>
              <Tabs
                value={this.state.value}
                classes={{ root: classes.root, indicator: classes.indicate }}
                onChange={this.HandleTabClick}
                variant="standard"
              >
                <Tab
                  label="Dashboard"
                  to="/dashboard"
                  component={Link}
                  style={{ color: "#000000" }}
                />
                <Tab
                  label="Bookings"
                  to="/bookings"
                  component={Link}
                  style={{ color: "#000000" }}
                />
                {role ? (
                  <Tab
                    label="Rooms"
                    to="/rooms"
                    component={Link}
                    style={{ color: "#000000" }}
                  />
                ) : (
                  ""
                )}
                {role ? (
                  <Tab
                    label="Users"
                    to="/users"
                    component={Link}
                    style={{ color: "#000000" }}
                  />
                ) : (
                  ""
                )}
              </Tabs>
            </Grid>
            <Grid item md={3} />
            <Grid item md={1}>
              <IconButton
                aria-label="Profile"
                aria-owns={open ? "profile" : undefined}
                aria-haspopup="true"
                onClick={this.handleClick}
              >
                <AccountCircle />
              </IconButton>

              <Menu
                id="profile"
                anchorEl={this.state.profile}
                open={open}
                onClose={this.HandleProfileClose}
                PaperProps={{
                  style: {
                    maxHeight: 48 * 4.5,
                    width: 150
                  }
                }}
              >
                <Link to="/profile" style={{ textDecoration: "none" }}>
                  <MenuItem key="profile" onClick={this.HandleProfileClose}>
                    profile
                  </MenuItem>
                </Link>{" "}
                <Link to="/logout" style={{ textDecoration: "none" }}>
                  <MenuItem key="logout" onClick={this.HandleProfileClose}>
                    Logout
                  </MenuItem>
                </Link>
              </Menu>
            </Grid>
          </Grid>
        </React.Fragment>
      );
    } else {
      component = (
        <Grid container spacing={24} justify="space-between">
          <Grid item>
            <Typography
              variant="headline"
              style={{ marginLeft: 10, marginTop: 10 }}
            >
              AABS
            </Typography>
          </Grid>
          <Grid item>
            <Tabs
              value={this.state.value}
              classes={{ root: classes.root, indicator: classes.indicate }}
              onChange={this.HandleTabClick}
              variant="standard"
            >
              <Tab
                label="login"
                style={{ color: "#000000" }}
                to="/login"
                component={Link}
              />
              <Tab
                label="Signup"
                style={{ color: "#000000" }}
                to="/signup"
                component={Link}
              />
            </Tabs>
          </Grid>
        </Grid>
      );
    }

    return (
      <div>
        <AppBar position="fixed" style={NavStyle}>
          {component}
        </AppBar>
      </div>
    );
  };
}

class Loading extends React.Component {
  render() {
    return <img src={loader} alt="Loading...." className="loading" />;
  }
}

const NavBar = withStyles(NavStyles)(NavBarComponent);

export { NavBar, Loading, PaginateLoading };
