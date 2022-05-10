import { ITransaction } from "./ITransaction";

export interface ISignedTransaction {
  transaction: ITransaction;
  signature: Buffer;
}