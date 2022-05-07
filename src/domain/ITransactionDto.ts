import { ITransaction } from "./ITransaction";

export interface ITransactionDto {
  transaction: ITransaction;
  signature: Buffer;
}