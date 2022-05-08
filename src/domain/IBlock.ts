import { ICoinbase } from "./ICoinbase";
import { ISignedTransaction } from "./ISignedTransaction";

export interface IBlock {
  nonce: number;
  previousHash: string;
  coinbase: ICoinbase; // public key
  signedTransaction: ISignedTransaction;
  timestamp: string;
  hash: string;
}