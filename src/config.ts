import * as fs from "fs";
import path from "path";
import { port } from "./app";
import { IConfig } from "./domain/IConfig";
import { Block } from "./models/block";
import { Node } from "./models/node";
import Wallet from "./models/wallet";

const fsPromises = fs.promises;

const fileName = `config.json`;

async function readFile(fileName: string): Promise<IConfig> {
  try {
    const file = await fsPromises.readFile(fileName, { encoding: "utf8" });
    const data = JSON.parse(file);

    return data;
  } catch (error) {
    return {
      knownNodes: [],
      blocks: []
    };
  }
}

function getValidLocation() {
  const directory = "nodes_data/";

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }

  return path.join(directory, `node-${port}.json`);
}

export async function getConfig(): Promise<IConfig> {
  const config = await readFile(fileName);
  const data = await readFile(getValidLocation());
  data.knownNodes = Node.mergeNodes(config.knownNodes, data.knownNodes, port);

  return data;
}

export function saveConfig() {
  const data = { 
    knownNodes: Node.instance.knownNodes, 
    blocks: Block.blocks,
    wallet: Wallet.instance
  };
  fs.writeFileSync(getValidLocation(), JSON.stringify(data, null, 4));
}
