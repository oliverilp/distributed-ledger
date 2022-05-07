import Wallet from "../models/wallet";
import { IChain } from "./IChain";
import { INode } from "./INode";

export interface IConfig {
  knownNodes: INode[];
  chain?: IChain;
  wallet?: Wallet;
}