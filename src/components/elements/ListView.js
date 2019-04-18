import React from "react";
import {
  Table,
  TableCell,
  TableHead,
  TableBody,
  TableRow,
  Paper,
  Grid,
  TextField,
  Select,
  InputLabel
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { PropTypes } from "prop-types";
import loadingForm from "./../../img/loading.gif";
import { fetchAsynchronous } from "./../controllers/fetch";
import { getCookie } from "./../cookie";
import { DMenu as Menu } from "./menu";
import { PaginateLoading } from "./nav";

const styles = () => ({
  paper: {
    marginTop: "20vh",
    marginLeft: "10vw",
    marginRight: "10vw"
  },
  thead: {
    background: "#24528c"
  },
  headelem: {
    color: "white"
  },
  tableRow: {
    transition: "0.3s",
    "&:hover": {
      background: "#e9f1f0",
      cursor: "pointer"
    }
  },
  loading: {
    marginTop: "40vh",
    marginLeft: "43vw"
  },
  loadingPaginate: {
    textAlign: "center"
  }
});

// Props to be passed:
// 1. header
// 2. body
// 3. function to handle table row click
// 4. total items in the list (including all the pages).

class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      pageLoading: false,
      page: 1,
      body: [],
      scroll: false,
      waiting: false
    };
  }

  componentDidMount() {
    window.addEventListener("scroll", this.onScroll, false);
    this.HandleAPIFetch();
  }

  HandleAPIFetch = () => {
    if (!this.state.scroll && !this.state.waiting) {
      let uri = this.props.uri;
      let headers = {
        Authorization: "Token " + getCookie("token")[0].value
      };
      fetchAsynchronous(uri, "GET", undefined, headers, this.HandleAPIResponse);
      this.setState({ waiting: true });
    }
  };

  HandleClick = value => {
    console.log("sample");
  };

  HandleAPIResponse = response => {
    let body = [],
      { classes: cn } = this.props;
    if (response.hasOwnProperty("error") && response.error === 1) {
      this.setState({ scroll: true });
    } else {
      for (let i in response.results) {
        let row = [];
        for (let j in this.props.apiQueries) {
          row.push(
            <TableCell key={i + j}>
              {response.results[i][this.props.apiQueries[j]]}
            </TableCell>
          );
        }
        if (this.props.menuNeeded) {
          // add the menu here
          row.push(
            <TableCell key={i + "more"}>
              <Menu
                label={this.props.menuType}
                body={this.props.menuList}
                HandleMenuClick={this.props.HandleMenuClick}
                iconType="more"
              />
            </TableCell>
          );
        }
        body.push(
          <TableRow
            key={response.results[i]["pk"]}
            className={cn.tableRow}
            onClick={this.props.onClick}
          >
            {row}
          </TableRow>
        );
      }
    }
    // Check if it is for the first page.
    if (this.state.page === 1) {
      // Remove the loading symbol, display the table
      this.setState({
        page: this.state.page + 1,
        loading: false,
        body: body,
        waiting: false
      });
    } else {
      // Remove the loading (paginate) symobol, add the contents.
      let PresentBody = this.state.body;
      PresentBody.push(...body);
      this.setState({
        page: this.state.page + 1,
        pageLoading: false,
        body: PresentBody,
        waiting: false
      });
    }
  };

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll, false);
  }

  onScroll = () => {
    // if scrolled to the bottom request the further page.
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
      this.state.scroll === false &&
      this.state.waiting === false
    ) {
      // came near to the bottom of the page, request for the new page.
      this.setState({ pageLoading: true });
      this.HandleAPIFetch();
    }
  };

  render = () => {
    let { onClick: tc, classes: cn, params: h } = this.props;
    let header = [];

    // Create the LIST HEADINGS
    for (let i in h) {
      header.push(
        <TableCell key={i} className={cn.headelem}>
          {h[i]}
        </TableCell>
      );
    }
    if (this.props.menuNeeded) {
      header.push(
        <TableCell key={header.length} className={cn.headelem}>
          More
        </TableCell>
      );
    }

    // Create the LIST BODY elements
    return (
      <React.Fragment>
        {this.state.loading === false ? (
          <React.Fragment>
            <Paper className={cn.paper}>
              <Table>
                <TableHead className={cn.thead}>
                  <TableRow>{header}</TableRow>
                </TableHead>
                <TableBody>{this.state.body}</TableBody>
              </Table>
            </Paper>
            {this.state.pageLoading !== false ? (
              <PaginateLoading classname={cn.PaginateLoading} />
            ) : (
              <React.Fragment>
                <br />
                <br />
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          <img src={loadingForm} alt="Loading...." className={cn.loading} />
        )}
      </React.Fragment>
    );
  };
}

ListView.propTypes = {
  classes: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
  params: PropTypes.array.isRequired
};

class SearchTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filtervalue: "",
      searchvalue: "",
      search: ""
    };
  }

  HandleAllFields = e => {
    let { name, value } = e;
    this.setState({ [name]: value });
  };

  render() {
    return (
      <React.Fragment>
        <Grid container spacing={24}>
          <Grid item md={4}>
            {this.props.choice[0] === true ? (
              <React.Fragment>
                <InputLabel htmlFor="filter">Filter by</InputLabel>
                <Select
                  value={this.state.filtervalue}
                  onChange={this.HandleAllFields}
                  fullWidth
                  inputProps={{
                    name: "filterChoice",
                    id: "filter"
                  }}
                >
                  {this.props.filterChoice}
                </Select>{" "}
              </React.Fragment>
            ) : (
              ""
            )}
          </Grid>
          <Grid item md={4}>
            {this.props.choice[1] === true ? (
              <React.Fragment>
                <InputLabel htmlFor="searchby">Search by</InputLabel>
                <Select
                  value={this.state.searchvalue}
                  onChange={this.HandleAllFields}
                  fullWidth
                  inputProps={{
                    name: "searchChoice",
                    id: "searchby"
                  }}
                >
                  {this.props.searchChoice}
                </Select>
              </React.Fragment>
            ) : (
              ""
            )}
          </Grid>
          <Grid item md={4}>
            <TextField
              id="search"
              label="search here"
              name="Search"
              margin="normal"
              variant="primary"
              value={this.state.search}
            />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(ListView);
export { SearchTable };
