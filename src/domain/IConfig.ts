import { Block } from "../models/block";
import Wallet from "../models/wallet";
import { INode } from "./INode";

export interface IConfig {
    knownNodes: INode[];
    blocks: Block[];
    wallet?: Wallet;
}