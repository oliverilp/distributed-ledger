import { IBlock } from "./IBlock";

export interface IChain {
  blocks: IBlock[];
  lastBlock: IBlock;
}