import { ISignedTransaction } from "./ISignedTransaction";

export interface ITransactionQueue {
  queue: ISignedTransaction[];
}
