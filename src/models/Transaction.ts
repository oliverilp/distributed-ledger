import { ITransaction } from "../domain/ITransaction";

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
}
