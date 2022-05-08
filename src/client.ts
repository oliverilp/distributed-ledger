import http from "http";
import net from 'node:net';

export function makeGetRequest(url: URL) {
  return new Promise<string>(async (resolve, reject) => {
    const reachable = await isPortReachable(parseInt(url.port), url.hostname);
    if (!reachable) {
      reject('Error: Not reachable');
      return;
    }

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
  return new Promise<string>(async (resolve, reject) => {
    const reachable = await isPortReachable(parseInt(url.port), url.hostname);
    if (!reachable) {
      reject('Error: Not reachable');
      return;
    }

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

export async function isPortReachable(port: number, host: string, timeout = 500) {
  const promise = new Promise<void>((resolve, reject) => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      reject();
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve();
    });
  });

  try {
    await promise;
    return true;
  } catch {
    return false;
  }
}
