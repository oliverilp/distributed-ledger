import { startApi } from "./server";
import { isPortReachable, makeGetRequest, makePostRequest } from "./client";
import { getConfig, saveConfig } from "./config";
import { Node } from "./models/node";
import { setTimeout } from 'timers/promises';
import Wallet from "./models/wallet";
import { INode } from "./domain/INode";
import { Chain } from "./models/chain";
import { ISignedTransaction } from "./domain/ISignedTransaction";
import { IChain } from "./domain/IChain";
import { uiSetBlocks } from "./ui";

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
      await makePostRequest(url, Node.instance.json);

      queriedNodes.push(node);
      Node.instance.knownNodes = Node.mergeNodes(Node.instance.knownNodes, [response], port);

      askForNodes(response.knownNodes!, queriedNodes, deadNodes);
    } catch (error) {
      Node.instance.knownNodes = Node.instance.knownNodes.filter((item) => item.url !== node.url);
      deadNodes.push(node);
    }
  }
}

export async function sendTransaction(amount: number, receiverPublicKey: string) {
  const dto = Wallet.instance.createTransaction(amount, receiverPublicKey);

  for (const node of Node.instance.knownNodes) {
    const url = new URL(`http://${node.ip}:${node.port}/transaction`);
    const reachable = await isPortReachable(parseInt(url.port), url.hostname);
    if (reachable) {
      makePostRequest(url, JSON.stringify(dto));
    }
  }
}

export async function sendBlock(signedTransaction: ISignedTransaction) {
  const block = await Chain.instance.addBlock(signedTransaction);

  for (const node of Node.instance.knownNodes) {
    const url = new URL(`http://${node.ip}:${node.port}/blocks`);
    const reachable = await isPortReachable(parseInt(url.port), url.hostname);
    if (reachable) {
      makePostRequest(url, block.json);
    }
  }
}

async function syncChainWithNodes() {
  for (const node of Node.instance.knownNodes) {
    const url = new URL(`http://${node.ip}:${node.port}/blocks`);
    const chain: IChain = JSON.parse(await makeGetRequest(url));
    if (chain.blocks.length > Chain.instance.blocks.length) {
      Chain.instance = Chain.mapToChainObject(chain);
      uiSetBlocks(Chain.instance.blocks);
    }
  }
}

export async function runApp() {
  console.log('Starting app.');

  startApi();
  await setTimeout(100);

  const { knownNodes, chain, wallet } = await getConfig();
  if (wallet) {
    Wallet.instance = new Wallet(wallet.publicKey, wallet.privateKey);
  }
  if (chain) {
    Chain.instance = Chain.mapToChainObject(chain);
    uiSetBlocks(Chain.instance.blocks);
  }

  Node.instance = new Node(ip, port, Wallet.instance.publicKey);

  askForNodes(knownNodes);

  await setTimeout(0);
  syncChainWithNodes();
}

process.on("SIGINT", function () {
  console.log("");
  console.log("Exiting...");
  Chain.instance.killChild();
  saveConfig();

  process.exit();
});
