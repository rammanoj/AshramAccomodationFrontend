const validator = {
  username: {
    rules: [
      {
        test: /^[a-z0-9_]+$/,
        message: "Username can contain lowecase letters and numbers only"
      },
      {
        test: value => {
          return value.length >= 8;
        },
        message: "Username must be longer than 7 characters"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  user: {
    rules: [
      {
        test: value => {
          return value.length >= 8;
        },
        message: "Username must be longer than 7 characters"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  password: {
    rules: [
      {
        test: value => {
          return value.length > 7;
        },
        message: "Password min length is 8"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  old_password: {
    rules: [
      {
        test: value => {
          return value.length > 7;
        },
        message: "Password min length is 8"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  confirm_password: {
    rules: [
      {
        test: value => {
          return value.length > 7;
        },
        message: "Password min length is 8"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  email: {
    rules: [
      {
        test: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        message: "Enter a valid email"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  mobile: {
    rules: [
      {
        // eslint-disable-next-line
        test: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
        message: "Enter a valid mobile number"
      },
      {
        test: value => {
          return value.length > 9;
        },
        message: "Min length is 10"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  },
  code: {
    rules: [
      {
        // eslint-disable-next-line
        test: value => {
          return value.length > 5;
        },
        message: "Min length of OTP is 6"
      },
      {
        test: /^([0-9]+)$/,
        message: "OTP has to be a number"
      }
    ],
    errors: [],
    valid: false,
    state: ""
  }
};

const updateValidators = (fieldName, value) => {
  let validators = validator;
  try {
    validators[fieldName].errors = [];
    validators[fieldName].state = value;
    validators[fieldName].valid = true;
    validators[fieldName].rules.forEach(rule => {
      if (rule.test instanceof RegExp) {
        if (!rule.test.test(value)) {
          validators[fieldName].errors.push(rule.message);
          validators[fieldName].valid = false;
        }
      }
      if (typeof rule.test === "function") {
        if (!rule.test(value)) {
          validators[fieldName].errors.push(rule.message);
          validators[fieldName].valid = false;
        }
      }
    });

    return validators[fieldName];
  } catch (e) {
    return "";
  }
};

const handleAllFields = (
  name,
  value,
  formFields,
  formFieldValues,
  usingDisabled,
  validator,
  update
) => {
  let current_validator = validator;
  if (name === "remember_me") {
    update(name, value);
  } else {
    let updated = updateValidators(name, value);
    if (usingDisabled) {
      let ind = formFields.indexOf(name);
      formFields.splice(ind, 1);
      formFieldValues.splice(ind, 1);
      let checkEmpty = formFieldValues.some(elem => elem === "");
      try {
        if (updated.errors.length > 0 || checkEmpty) {
          update("disabled", true);
        } else {
          update("disabled", false);
        }
      } catch (e) {
        if (checkEmpty) {
          update("disabled", true);
        } else {
          update("disabled", false);
        }
      }
    }
    current_validator[name] = updated;
    // In Javascript, when you create an object literal {} and
    //  you wrap the object’s key in array brackets [key] you can dynamically set that key.
    update("validators", current_validator);
    update(name, value);
  }
};

export default validator;
export { updateValidators, handleAllFields };
