import readline from "readline";
import { api } from "./server";
import { makeGetRequest, makePostRequest } from "./client";
import { getConfig, saveConfig } from "./config";
import { Node } from "./node";
import { Block } from "./block";

const ip = "127.0.0.1";
export let port = 10000;
const args = process.argv.slice(2);
if (args.length > 0) {
  port = parseInt(args[0]);
}
console.log(`Using local port: ${port}`);

api(port);

function askForNodes(
  nodes: Node[],
  queriedNodes: Node[] = [],
  deadNodes: Node[] = []
) {
  nodes = nodes.filter((item) => !Node.contains(item, deadNodes));
  Node.nodes = Node.mergeNodes(Node.nodes, nodes, port);

  for (const node of nodes) {
    if (node.ip === ip && node.port === port) {
      continue;
    }
    if (Node.contains(node, queriedNodes)) {
      continue;
    }

    const url = new URL(`http://${node.ip}:${node.port}/addresses`);
    url.searchParams.append("ip", ip);
    url.searchParams.append("port", port.toString());

    makeGetRequest(url, (response: string | null) => {
      queriedNodes.push(node);
      if (response === null) {
        Node.nodes = Node.nodes.filter((item) => item.url !== node.url);
        deadNodes.push(node);
        return;
      }

      const newNodes = Node.mapToNodeObjects(JSON.parse(response));
      askForNodes(newNodes, queriedNodes, deadNodes);
    });
  }
}

function addBlock(): Block {
  const block = new Block();
  Block.blocks.push(block);

  askForNodes(Node.nodes);

  setTimeout(() => {
    const data = JSON.stringify(block);
  
    for (const node of Node.nodes) {
      const postURL = new URL(`http://${node.ip}:${node.port}/blocks`);
      makePostRequest(postURL, data, (response: string) => { });
    }
  }, 0);

  return block
}

async function handleUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const prompt = (query: any) =>
    new Promise((resolve) => rl.question(query, resolve));

  while (true) {
    const input: any = await prompt("\nEnter a command: ");
    switch (input.toLowerCase()) {
      case "nodes":
        console.log("Known nodes:");
        console.log(Node.nodes);
        break;
      case "blocks":
        console.log("Blocks:");
        console.log(Block.blocks);
        break;
      case "add block":
        console.log("Added new block:");
        console.log(addBlock());
        break;
      default:
        break;
    }
  }
}

setTimeout(async () => {
  const { knownNodes } = await getConfig();
  askForNodes(knownNodes);

  handleUserInput();
}, 100);

process.on("SIGINT", function () {
  console.log("");
  console.log("Exiting...");
  saveConfig();

  process.exit();
});
