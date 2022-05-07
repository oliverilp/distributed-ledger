import * as crypto from 'crypto';
import { IBlock } from '../domain/IBlock';
import Transaction from './transaction';

export class Block implements IBlock {
  public nonce = 0;

  constructor(
    public previousHash: string,
    public transaction: Transaction,
    public timestamp = new Date().toISOString()
  ) { }

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }

  private get copy() {
    const copy = JSON.parse(JSON.stringify(this));
    copy.hash = this.hash;
    return copy
  }

  get json() {
    return JSON.stringify(this.copy);
  }
}
