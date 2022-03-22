import http from "http";
import { Node } from "./node";

export const api = (port: number) => {
  const server = http.createServer(async (req: any, res: any) => {
    const url = new URL(`http://127.0.0.1${req.url}`);
    log(req.url);

    const data = await getPostData(req);

    if (req.url === "/") {
      log("Empty path");
    } else if (req.url.startsWith("/addresses")) {
      const ipParam = url.searchParams.get("ip");
      const portParam = url.searchParams.get("port");
      if (ipParam !== null && portParam !== null) {
        res.writeHead(200);
        res.end(JSON.stringify(Node.nodes));

        const node = new Node(ipParam, parseInt(portParam));
        if (!Node.contains(node, Node.nodes)) {
          Node.nodes.push(node);
        }

        log("");
        console.log(Node.nodes);

        log(node.url);
        return;
      }
    }

    res.writeHead(500);
    res.end(`Something went wrong, url: ${req.url}`);
  });

  server.listen(port);
};

async function getPostData(req: any) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  return Buffer.concat(buffers).toString();
}

function log(message: any) {
  console.log(`[Server] ${message}`);
}
