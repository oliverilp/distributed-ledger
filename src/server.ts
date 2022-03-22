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
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(Node.nodes));

        const node = new Node(ipParam, parseInt(portParam));
        if (!Node.contains(node, Node.nodes)) {
          Node.nodes.push(node);
        }
        return;
      }
    } else if (req.url.startsWith('/block?')) {
      const hash = url.searchParams.get("hash");
      if (hash) {
        const block = Block.blocks.find(item => item.hash === hash);
        res.setHeader('Content-Type', 'application/json');
        if (!block) {
          res.writeHead(404);
          res.end('null');
        }

        res.writeHead(200);
        res.end(block?.json);
        return;
      }
    } else if (req.url.startsWith("/blocks")) {
      if (postString) {
        const temp: Block = JSON.parse(postString);
        const block = new Block(...Object.values(temp));
        if (block.hash === temp.hash) {
          Block.blocks.push(block);
        }
      }
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(Block.blocksJson);
      return;
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
