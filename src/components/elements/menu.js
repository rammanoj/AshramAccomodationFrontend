import React from "react";
import { Menu, MenuItem, IconButton } from "@material-ui/core";
import { AccountCircle } from "@material-ui/icons";
import MoreVertIcon from "@material-ui/icons/MoreVert";

const getIcon = iconType => {
  switch (iconType) {
    case "more":
      return <MoreVertIcon />;
    case "profile":
      return <AccountCircle />;
  }
};

class DMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: null
    };
  }

  handleClick = e => {
    this.setState({ menu: e.currentTarget });
  };

  HandleClose = e => {
    this.setState({ menu: null });
  };

  render = () => {
    let open = Boolean(this.state.menu);
    return (
      <React.Fragment>
        <IconButton
          aria-label={this.props.label}
          aria-owns={open ? this.props.label : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          {getIcon(this.props.iconType)}
        </IconButton>

        <Menu
          id={this.props.label}
          anchorEl={this.state.menu}
          open={open}
          onClose={this.HandleClose}
          PaperProps={{
            style: {
              maxHeight: 48 * 4.5,
              width: 150
            }
          }}
        >
          {this.props.body.map((key, value) => (
            <MenuItem
              key={key}
              onClick={() => this.props.HandleMenuClick(this.props.id)}
            >
              {key}
            </MenuItem>
          ))}
        </Menu>
      </React.Fragment>
    );
  };
}

export { DMenu };
