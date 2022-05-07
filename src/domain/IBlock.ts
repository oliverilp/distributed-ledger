import { ITransaction } from "./ITransaction";

export interface IBlock {
  nonce: number;
  previousHash: string; 
  transaction: ITransaction;
  timestamp: string;
  hash: string;
}