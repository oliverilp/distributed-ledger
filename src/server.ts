import http from "http";
import { Block } from "./models/block";
import { Node } from "./models/node";
import { ip, port } from "./app";
import Wallet from "./models/wallet";
import { INode } from "./domain/INode";

/**
 * Run a server on the specified port.
 */
export const startApi = () => {
  const server = http.createServer(async (req: any, res: any) => {
    const url = new URL(`http://127.0.0.1${req.url}`);

    const contents = await getContents(req);

    if (req.url.startsWith("/node-info") && !contents) {
      getNodeInfo(res, url);
      return;
    } else if (req.url.startsWith("/node-info")) {
      saveNodeInfo(res, contents);
      return;
    } else if (req.url.startsWith('/block?')) {
      getBlock(res, url);
      return;
    } else if (req.url.startsWith("/blocks")) {
      saveBlock(res, contents);
      return;
    }

    res.writeHead(500);
    res.end(`Something went wrong, url: ${req.url}`);
  });

  server.listen(port);
}

function getNodeInfo(res: any, url: URL) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);

  res.end(Node.instance.json);
}

function saveNodeInfo(res: any, contents: string) {  
  if (contents) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(contents);

    const node: INode = JSON.parse(contents);
    delete node.knownNodes;

    if (!Node.contains(node, Node.instance.knownNodes)) {
      Node.instance.knownNodes = [...Node.instance.knownNodes, node];
    }
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
  }
}

function saveBlock(res: any, contents: string) {
  if (contents) {
    const temp: Block = JSON.parse(contents);
    const block = new Block(temp.previousHash, temp.transaction, temp.timeStamp);
    if (block.hash === temp.hash) {
      Block.blocks = [...Block.blocks, block];
    }
  }
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(Block.blocksJson);
}

async function getContents(req: any) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  return Buffer.concat(buffers).toString();
}
