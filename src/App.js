import React, { Component } from "react";
import "./App.css";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import {
  Login,
  Register,
  ForgotPassword,
  MobileVerify,
  Logout
} from "./components/Auth";
import { Dashboard } from "./components/dashboard";
import Bookings from "./components/bookings";
import Booking from "./components/booking";
import { Profile } from "./components/profile";
import NotFound from "./components/404";
import Users from "./components/users";
import Rooms from "./components/rooms";

// This is the Root Page, it consists of routers to all the pages.
class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          {/* Login Router */}
          <Route exact path="/login" component={Login} />
          {/* User Register Router */}
          <Route
            exact
            path="/signup"
            component={() => <Register user_type="Devotee" />}
          />
          {/* Admin Register Router */}
          <Route
            exact
            path="/admin/register/:link"
            component={props => (
              <Register user_type="Admin" link={props.match.params.link} />
            )}
          />
          {/* Forgot Password Send Verification */}
          <Route exact path="/forgotpassword/" component={ForgotPassword} />
          {/* Verify mobile number */}
          <Route exact path="/(mobileverify)" component={MobileVerify} />
          {/* Home page */}
          <Route exact path="/(dashboard|home)" component={Dashboard} />
          {/* User Bookings */}
          <Route exact path="/(bookings)" component={Bookings} />
          {/* Book Room */}
          <Route exact path="/(roombooking)" component={Booking} />
          {/* Room list view */}
          <Route exact path="/rooms" component={Rooms} />
          {/* Users list view */}
          <Route exact path="/(users/list|users)" component={Users} />
          {/* User Profile page */}
          <Route exact path="/profile" component={Profile} />
          {/* Logout the user */}
          <Route exact path="/logout" component={Logout} />

          <Route exact path="" component={Dashboard} />

          {/* 404 Handler */}
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default App;
