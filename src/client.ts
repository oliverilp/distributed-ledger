import http from "http";

export function makeGetRequest(url: URL, callback: Function) {
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: "GET",
  };

  const req = http.request(options, (res) => {
    // log(`statusCode: ${res.statusCode}`);
    let result = "";

    res.on("data", (data) => {
      result += data;
    });

    res.on("end", () => {
      callback(result);
    });
  });

  req.on("error", (error: any) => {
    console.error(error.code);
    callback(null);
  });

  req.end();
}

export function makePostRequest(url: URL, data: string, callback: Function) {
  const options = {
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": data.length,
    },
  };

  const req = http.request(options, (res) => {
    // log(`statusCode: ${res.statusCode}`);
    let result = "";

    res.on("data", (data) => {
      result += data;
    });

    res.on("end", () => {
      callback(result);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

function log(message: string) {
  console.log(`[Client] ${message}`);
}
