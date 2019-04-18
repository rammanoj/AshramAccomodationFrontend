import React from "react";
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  withStyles
} from "@material-ui/core/";

/*
    The Form component generates '<form />' tags.

    --> array 'inputs' with objects containing values of Container Input and Select
    --> 'header' = heading to the form.
    --> 'onClick' = click handler to the function.
    --> 'button' = name of the button.
    --> 'disabled' = to enable/disable the button.
    --> 'message' = to display if there is any message
    --> 'messageClass' = class to the message display div
    
*/

const formStyle = () => ({
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
  checkroot: {
    "&$checked": {
      color: "#3a87f2"
    }
  },
  checked: {},
  button: {
    background: "#3a87f2",
    color: "#ffffff",
    "&:hover": {
      background: "#0068f9"
    }
  }
});

class FormComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  addInputs = () => {
    let { props: p } = this,
      inputs = [];
    let { classes } = p;
    console.log(classes);
    for (let i in p.inputs) {
      if (p.inputs[i].type === "checkbox") {
        inputs.push(
          <li key={i}>
            <FormControlLabel
              control={
                <Checkbox
                  onChange={p.inputs[i].handle}
                  checked={p.inputs[i].value}
                  name={p.inputs[i].name}
                  id={p.inputs[i].name}
                  classes={{
                    root: classes.checkroot,
                    checked: classes.checked
                  }}
                />
              }
              label={p.inputs[i].labels}
            />
          </li>
        );
      } else {
        inputs.push(
          <li key={i}>
            <TextField
              id={p.inputs[i].name}
              label={p.inputs[i].labels}
              onChange={p.inputs[i].handle}
              value={p.inputs[i].value}
              name={p.inputs[i].name}
              helperText={p.validators[i]}
              fullWidth
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
              type={p.inputs[i].type}
            />
          </li>
        );
      }
    }
    return inputs;
  };

  render = () => {
    let inputs = this.addInputs(),
      button,
      { classes } = this.props;
    if (this.props.formLoading === false) {
      if (this.props.disabled === true) {
        button = (
          <Button variant="contained" disabled onClick={this.props.onClick}>
            {this.props.button}
          </Button>
        );
      } else {
        button = (
          <Button
            variant="contained"
            onClick={this.props.onClick}
            className={classes.button}
          >
            {this.props.button}
          </Button>
        );
      }
    } else {
      button = this.props.formLoading;
    }
    return (
      <div>
        <div
          style={{
            color: this.props.messageClass,
            paddingBottom: 1,
            paddingLeft: 60,
            fontStyle: "bold"
          }}
        >
          <p>{this.props.message !== "" ? this.props.message : ""}</p>
        </div>
        <form className={this.props.formClass}>
          <ul>
            {inputs}
            <li>{button}</li>
          </ul>
        </form>
      </div>
    );
  };
}

const UForm = withStyles(formStyle)(FormComponent);

export { UForm };
