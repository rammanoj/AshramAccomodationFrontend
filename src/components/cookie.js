import Cookies from "universal-cookie";
// This file deals with the cookies over the entire project

const cookie = new Cookies();

// Authenticate CookieExistance
export const CheckCookieStatus = name => {
  if (cookie.get(name) === undefined) {
    return false;
  } else {
    if (cookie.get(name).expires > Date.now()) {
      return true;
    } else {
      deleteCookie([name]);
      return false;
    }
  }
};

// GetCookie
export const getCookie = name => {
  let status = CheckCookieStatus(name);
  if (status) {
    return [cookie.get(name), status];
  } else {
    return [undefined, status];
  }
};

// SetCookie
export const setCookie = names_obj => {
  for (let i in names_obj) {
    if (getCookie(names_obj[i].value)[0] !== undefined) {
      cookie.deleteCookie([names_obj[i].value]);
    }
    cookie.set(
      names_obj[i].key,
      {
        value: names_obj[i].value,
        expires: names_obj[i].age
      },
      {
        path: "/",
        expires: new Date(names_obj[i].age)
      }
    );
  }
};

// DeleteCookie
export const deleteCookie = list_names => {
  for (let i in list_names) {
    cookie.remove(list_names[i]);
  }
};
