import * as crypto from 'crypto';
import { ISignedTransaction } from "../domain/ISignedTransaction";
import { ITransaction } from "../domain/ITransaction";
import { Balance } from './Balance';
import { Chain } from './Chain';

export default class Transaction implements ITransaction {
  public timestamp: string;

  constructor(
    public amount: number,
    public sender: string, // public key
    public receiver: string // public key
  ) {
    this.timestamp = new Date().toISOString();
  }

  toString() {
    return JSON.stringify(this);
  }

  static isValid(signedTransaction: ISignedTransaction, chain: Chain): boolean {
    const { transaction, signature } = signedTransaction;

    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(transaction));
    const buffer = Buffer.from(signature);
    const isSignatureValid = verify.verify(transaction.sender, buffer);

    const balance = Balance.instance.copy;
    balance.updateEveryBalance(chain);
    return isSignatureValid && balance.isValid;
  }
}
