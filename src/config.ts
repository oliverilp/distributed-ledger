import * as fs from "fs";
import path from "path";
import { port } from "./app";
import { Block } from "./models/block";
import { Node } from "./models/node";

const fsPromises = fs.promises;

interface Config {
  knownNodes: Node[];
}

const fileName = `config.json`;

async function readFile(fileName: string): Promise<Config> {
  try {
    const file = await fsPromises.readFile(fileName, { encoding: "utf8" });
    const data = JSON.parse(file);
    data.knownNodes = Node.mapToNodeObjects(data.knownNodes);

    return data;
  } catch (error) {
    // console.log("Warning: json file is missing.");
    return { knownNodes: [new Node("127.0.0.1", 10000)] };
  }
}

function getValidLocation() {
  const directory = "nodes_data/";

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  return path.join(directory, `node-${port}.json`);
}

export async function getConfig(): Promise<Config> {
  const config = await readFile(fileName);
  const data = await readFile(getValidLocation());
  data.knownNodes = Node.mergeNodes(config.knownNodes, data.knownNodes, port);

  return data;
}

export function saveConfig() {
  const data = { knownNodes: Node.nodes, blocks: Block.blocks };
  fs.writeFileSync(getValidLocation(), JSON.stringify(data));
}
