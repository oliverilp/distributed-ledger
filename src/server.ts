import http from "http";
import { Block } from "./block";
import { Node } from "./node";

export const api = (port: number) => {
  const server = http.createServer(async (req: any, res: any) => {
    const url = new URL(`http://127.0.0.1${req.url}`);

    const postString = await getPostString(req);

    if (req.url.startsWith("/addresses")) {
      const ipParam = url.searchParams.get("ip");
      const portParam = url.searchParams.get("port");
      if (ipParam !== null && portParam !== null) {
        res.writeHead(200);
        res.end(JSON.stringify(Node.nodes));

        const node = new Node(ipParam, parseInt(portParam));
        if (!Node.contains(node, Node.nodes)) {
          Node.nodes.push(node);
        }

        return;
      }
    } else if (req.url.startsWith("/blocks")) {
      res.writeHead(200);
      const temp: Block = JSON.parse(postString);
      const block = new Block(...Object.values(temp));

      Block.blocks.push(block);
      res.end('ok');
      return
    }

    res.writeHead(500);
    res.end(`Something went wrong, url: ${req.url}`);
  });

  server.listen(port);
};

async function getPostString(req: any) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  return Buffer.concat(buffers).toString();
}

function log(message: any) {
  console.log(`[Server] ${message}`);
}
