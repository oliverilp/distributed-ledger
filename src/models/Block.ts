import * as crypto from 'crypto';
import { IBlock } from '../domain/IBlock';
import { ICoinbase } from '../domain/ICoinbase';
import { ISignedTransaction } from '../domain/ISignedTransaction';
import { Chain } from './Chain';

export class Block implements IBlock {
  constructor(
    public previousHash: string,
    public coinbase: ICoinbase,
    public merkleRoot: string,
    public signedTransactionList: ISignedTransaction[],
    public nonce = 0,
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

  static isValid(block: Block, temp: IBlock): boolean {
    return (
      block.hash === temp.hash &&
      block.hash.startsWith('00000') &&
      block.previousHash === Chain.instance.lastHash
    );
  }

  static mapToBlockObject(block: IBlock): Block {
    return new Block(
      block.previousHash,
      block.coinbase,
      block.merkleRoot,
      block.signedTransactionList,
      block.nonce,
      block.timestamp
    );
  }
}
