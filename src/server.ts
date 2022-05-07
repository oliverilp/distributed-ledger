import http from "http";
import * as crypto from 'crypto';
import { Block } from "./models/block";
import { Node } from "./models/node";
import { port } from "./app";
import { INode } from "./domain/INode";
import { ITransactionDto } from "./domain/ITransactionDto";
import { Chain } from "./models/chain";

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
    } else if (req.url.startsWith("/transaction")) {
      saveTransaction(res, contents);
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

function saveTransaction(res: any, contents: string) {
  if (contents) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(contents);

    const dto: ITransactionDto = JSON.parse(contents);

    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(dto.transaction));
    const buffer = Buffer.from(dto.signature);

    const isValid = verify.verify(dto.transaction.sender, buffer);
    if (isValid) {
      Chain.instance.addBlock(dto.transaction);
    }
  }
}

function getBlock(res: any, url: URL) {
  const hash = url.searchParams.get("hash");
  if (hash) {
    const block = Chain.instance.blocks.find(item => item.hash === hash);
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
    const block = new Block(temp.previousHash, temp.transaction, temp.timestamp);
    if (block.hash === temp.hash) {
      Chain.instance.blocks = [...Chain.instance.blocks, block];
    }
  }
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(JSON.stringify(Chain.instance.blocks));
}

async function getContents(req: any) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  return Buffer.concat(buffers).toString();
}
