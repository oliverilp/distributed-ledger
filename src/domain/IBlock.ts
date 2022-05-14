import { ICoinbase } from "./ICoinbase";
import { ISignedTransaction } from "./ISignedTransaction";

export interface IBlock {
  nonce: number;
  previousHash: string;
  coinbase: ICoinbase; // public key
  merkleRoot: string,
  signedTransactionList: ISignedTransaction[];
  timestamp: string;
  hash: string;
}