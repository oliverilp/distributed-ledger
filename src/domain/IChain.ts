import { IBlock } from "./IBlock";

export interface IChain {
  blocks: IBlock[];
  lastHash: string;
}