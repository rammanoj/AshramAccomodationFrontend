import React from "react";

/*
    Input Component designs the '<input />' element
    props:
    --> liClass = provides the 'class' attribute to the '<li>' tag.
    
    --> labelId = provides the 'id' attribute to the label
    -->  labelClass = provides the 'class' attribute to the label
    --> label = provides the value of the label tag

    --> type = specifies the 'type' of the input
    --> name = provides the 'name' attribute to the input
    --> value = provides the 'value' attribute to the input
    --> inputClass = provides the 'class' attribute to the input
    --> inputId = provides the 'id' attribute to the input
    --> onChange = modifies the input with corresponding change.

*/
class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  HandleFocus = e => {
    let name = e.target.name;
    console.log(name);
    document.getElementById(name).parentElement.style.boxShadow =
      "8px 1px 3px 3px #888888";
  };

  HandleBlur = e => {
    let name = e.target.name;
    document.getElementById(name).parentElement.style.boxShadow = "";
  };

  render = () => {
    let { props: p } = this;
    if (p.type === "checkbox") {
      return (
        <li>
          <input
            type={p.type}
            name={p.name}
            value={p.value}
            id={p.inputId}
            onChange={p.handle}
            checked={p.value || ""}
          />
          {"  "}
          <label htmlFor={p.inputId}>{p.label}</label>
        </li>
      );
    } else {
      return (
        <li className={p.liClass}>
          <label htmlFor={p.inputId} className={p.labelClass}>
            {p.label}
          </label>
          <input
            type={p.type}
            name={p.name}
            className={p.inputClass}
            id={p.inputId}
            placeholder={p.placeholder}
            onChange={p.handle}
            onFocus={this.HandleFocus}
            onBlur={this.HandleBlur}
            value={p.value || ""}
          />
          <span>{p.validators}</span>
        </li>
      );
    }
  };
}

export { Input };
