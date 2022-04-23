import { startApi } from "./server";
import { makeGetRequest, makePostRequest } from "./client";
import { getConfig, saveConfig } from "./config";
import { Node } from "./models/node";
import { Block } from "./models/block";

const ip = "127.0.0.1";
export let port = 10000;
const args = process.argv.slice(2);
if (args.length > 0) {
  port = parseInt(args[0]);
}

async function askForNodes(
  nodes: Node[],
  queriedNodes: Node[] = [],
  deadNodes: Node[] = []
) {
  nodes = nodes.filter((node) => !Node.contains(node, deadNodes));
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

    try {
      const response = await makeGetRequest(url);
      queriedNodes.push(node);
      const newNodes = Node.mapToNodeObjects(JSON.parse(response));
      askForNodes(newNodes, queriedNodes, deadNodes);
    } catch (error) {
      Node.nodes = Node.nodes.filter((item) => item.url !== node.url);
      deadNodes.push(node);
    }
  }
}

export function addBlock(): Block {
  const block = new Block();
  Block.blocks = [...Block.blocks, block];

  askForNodes(Node.nodes);

  setTimeout(async () => {
    for (const node of Node.nodes) {
      const postURL = new URL(`http://${node.ip}:${node.port}/blocks`);
      await makePostRequest(postURL, block.json);
    }
  }, 0);

  return block
}

export function runApp() {
  startApi(port);

  setTimeout(async () => {
    const { knownNodes } = await getConfig();
    askForNodes(knownNodes);
  }, 100);
}

process.on("SIGINT", function () {
  console.log("");
  console.log("Exiting...");
  saveConfig();

  process.exit();
});
