export const fetchSynchronous = async (uri, method, data, headers) => {
  let response = await fetch(uri, {
    method: method,
    body: JSON.stringify(data),
    headers: headers
  });

  let responseData = await response.json();
  return responseData;
};

export const fetchAsynchronous = (uri, method, data, headers, callback) => {
  console.log(data);
  fetch(uri, {
    method: method,
    body: method === "GET" ? undefined : JSON.stringify(data),
    headers: headers
  })
    .then(response => response.json())
    .then(object => callback(object))
    .catch(error => {
      console.log(error);
      //   alert("Error occured on the server, please try again later");
    });
};
