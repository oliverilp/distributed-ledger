import http from "http";

export function makeGetRequest(url: URL) {
  return new Promise<string>((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: "GET",
    };

    const req = http.request(options, (res) => {
      let result = "";

      res.on("data", (data) => {
        result += data;
      });

      res.on("end", () => {
        resolve(result);
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

export function makePostRequest(url: URL, data: string) {
  return new Promise<string>((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };
  
    const req = http.request(options, (res) => {
      let result = "";
  
      res.on("data", (data) => {
        result += data;
      });
  
      res.on("end", () => {
        resolve(result);
      });
    });
  
    req.on("error", (error) => {
      reject(error);
    });
  
    req.write(data);
    req.end();
  });
}
