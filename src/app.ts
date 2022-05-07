import { startApi } from "./server";
import { makeGetRequest, makePostRequest } from "./client";
import { getConfig, saveConfig } from "./config";
import { Node } from "./models/node";
import { Block } from "./models/block";
import { setTimeout } from 'timers/promises';
import Transaction from "./models/transaction";
import Wallet from "./models/wallet";
import { INode } from "./domain/INode";

export const ip = "127.0.0.1";
export let port = 10000;
const args = process.argv.slice(2);
if (args.length > 0) {
  port = parseInt(args[0]);
}

async function askForNodes(
  nodes: INode[],
  queriedNodes: INode[] = [],
  deadNodes: INode[] = []
) {

  nodes = nodes.filter((node) => !Node.contains(node, deadNodes));
  Node.instance.knownNodes = Node.mergeNodes(Node.instance.knownNodes, nodes, port);
  Node.instance.knownNodes.forEach((node: INode) => delete node.knownNodes);

  for (const node of nodes) {
    if (node.ip === ip && node.port === port) {
      continue;
    }
    if (Node.contains(node, queriedNodes)) {
      continue;
    }

    const url = new URL(`http://${node.ip}:${node.port}/node-info`);

    try {
      const response: INode = JSON.parse(await makeGetRequest(url));
      makePostRequest(url, Node.instance.json);

      queriedNodes.push(node);
      Node.instance.knownNodes = Node.mergeNodes(Node.instance.knownNodes, [response], port);

      askForNodes(response.knownNodes!, queriedNodes, deadNodes);
    } catch (error) {
      Node.instance.knownNodes = Node.instance.knownNodes.filter((item) => item.url !== node.url);
      deadNodes.push(node);
    }
  }
}

export async function addBlock(): Promise<Block> {
  const block = new Block(Block.lastHash, new Transaction(20, '1', '2'));
  Block.blocks = [...Block.blocks, block];

  askForNodes(Node.instance.knownNodes);
  await setTimeout(0);

  for (const node of Node.instance.knownNodes) {
    const postURL = new URL(`http://${node.ip}:${node.port}/blocks`);
    makePostRequest(postURL, block.json);
  }

  return block
}

// export async function sendWallet(): Promise<void> {
//   const block = new Block(Block.lastHash, new Transaction(20, '1', '2'));
//   Block.blocks = [...Block.blocks, block];

//   askForNodes(Node.instance.knownNodes);
//   await setTimeout(0);

//   for (const node of Node.instance.knownNodes) {
//     const postURL = new URL(`http://${node.ip}:${node.port}/blocks`);
//     makePostRequest(postURL, block.json);
//   }
// }

export async function runApp() {
  startApi();
  await setTimeout(100);

  const { knownNodes, blocks, wallet } = await getConfig();
  if (wallet) {
    Wallet.instance = new Wallet(wallet.publicKey, wallet.privateKey);
  }
  Node.instance = new Node(ip, port, Wallet.instance.publicKey);

  Block.blocks = Block.mapToBlockObjects(blocks);

  askForNodes(knownNodes);
}

process.on("SIGINT", function () {
  console.log("");
  console.log("Exiting...");
  saveConfig();

  process.exit();
});
