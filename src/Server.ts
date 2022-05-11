import http from "http";
import { Block } from "./models/Block";
import { Node } from "./models/Node";
import { collectTransaction, port } from "./App";
import { INode } from "./domain/INode";
import { ISignedTransaction } from "./domain/ISignedTransaction";
import { Chain } from "./models/Chain";
import { IBlock } from "./domain/IBlock";
import TransactionQueue from "./models/TransactionQueue";
import { logAddEmptyNewBlock, logAddNewBlock, logRejectNewBlock } from "./Logger";

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
    } else if (req.url.startsWith('/blocks') && !contents) {
      getBlocksList(res);
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

    const signedTransaction: ISignedTransaction = JSON.parse(contents);
    collectTransaction(signedTransaction);
  }
}

function getBlocksList(res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(200);
  res.end(Chain.instance.json);
}

function saveBlock(res: any, contents: string) {
  if (contents) {
    const temp: IBlock = JSON.parse(contents);
    const block = Block.mapToBlockObject(temp);
    if (Block.isValid(block, temp)) {
      if (block.signedTransactionList.length === 0) {
        logAddEmptyNewBlock(block.hash);
      } else {
        logAddNewBlock(block.hash);
      }

      Chain.instance.blocks = [...Chain.instance.blocks, block];
      Chain.instance.killChild();
      TransactionQueue.instance.queue = [];
    } else {
      logRejectNewBlock(block.hash);
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
