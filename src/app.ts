import { api } from "./server";
import { makeGetRequest, makePostRequest } from "./client";
import { getConfig, saveConfig } from "./config";
import { Node } from "./node";

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
  nodes = nodes.filter(item => !Node.contains(item, deadNodes));
  Node.nodes = Node.mergeNodes(Node.nodes, nodes, port);
  console.log("top");
  console.log(Node.nodes);

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
    console.log(url.toString());

    makeGetRequest(url, (response: string | null) => {
      queriedNodes.push(node);
      if (response === null) {
        Node.nodes = Node.nodes.filter((item) => item.url !== node.url);
        deadNodes.push(node);
        return;
      }

      const newNodes = Node.mapToNodeObjects(JSON.parse(response));
      // nodesAsked = [...nodesAsked, ...nodes];
      askForNodes(newNodes, queriedNodes, deadNodes);
    });
  }
}

setTimeout(async () => {
  const { knownNodes } = await getConfig();
  askForNodes(knownNodes);

  // const data = JSON.stringify({
  //   todo: 'Buy the milk',
  // });

  // const postURL = new URL(`http://127.0.0.1:${port}/post`);
  // makePostRequest(postURL, data, (response: string) => console.log(response));
}, 100);

process.on("SIGINT", function () {
  console.log("");
  console.log("Exiting...");
  saveConfig();

  process.exit();
});
