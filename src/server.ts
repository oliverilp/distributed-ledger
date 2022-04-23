import http from "http";
import { Block } from "./models/block";
import { Node } from "./models/node";

/**
 * Run a server on the specified port.
 */
export const startApi = (port: number) => {
  const server = http.createServer(async (req: any, res: any) => {
    const url = new URL(`http://127.0.0.1${req.url}`);

    const contents = await getContents(req);

    if (req.url.startsWith("/addresses")) {
      getAddresses(res, url);
    } else if (req.url.startsWith('/block?')) {
      getBlock(res, url);
    } else if (req.url.startsWith("/blocks")) {
      saveBlock(res, contents);
    }

    res.writeHead(500);
    res.end(`Something went wrong, url: ${req.url}`);
  });

  server.listen(port);
};

function getAddresses(res: any, url: URL) {
  const ipParam = url.searchParams.get("ip");
  const portParam = url.searchParams.get("port");
  if (ipParam !== null && portParam !== null) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify(Node.nodes));

    const node = new Node(ipParam, parseInt(portParam));
    if (!Node.contains(node, Node.nodes)) {
      Node.nodes = [...Node.nodes, node];
    }
    return;
  }
}

function getBlock(res: any, url: URL) {
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
}

function saveBlock(res: any, contents: string) {
  if (contents) {
    const temp: Block = JSON.parse(contents);
    const block = new Block(...Object.values(temp));
    if (block.hash === temp.hash) {
      Block.blocks = [...Block.blocks, block];
    }
  }
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(Block.blocksJson);
  return;
}

async function getContents(req: any) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  return Buffer.concat(buffers).toString();
}
