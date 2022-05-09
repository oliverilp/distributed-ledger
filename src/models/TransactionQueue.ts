import { ISignedTransaction } from "../domain/ISignedTransaction";
import { ITransactionQueue } from "../domain/ITransactionQueue";

export default class TransactionQueue implements ITransactionQueue {
  public static instance = new TransactionQueue();

  queue: ISignedTransaction[] = [];
}