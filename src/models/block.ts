import * as crypto from 'crypto';
import { uiSetBlocks } from '../ui';
import Transaction from './transaction';

export class Block {
  private static _blocks: Block[] = [];

  static get blocks() {
    return this._blocks;
  }

  static set blocks(blocks) {
    this._blocks = blocks;
    uiSetBlocks(Block.blocks);
  }

  public nonce = 0;

  constructor(
    public previousHash: string,
    public transaction: Transaction,
    public timeStamp = Date.now()
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

  static get blocksJson() {
    const blocks = Block.blocks.map(block => block.copy)
    return JSON.stringify(blocks);
  }

  static get lastBlock() {
    return Block.blocks[Block.blocks.length - 1];
  }

  static get lastHash() {
    return Block.lastBlock !== undefined ? Block.lastBlock.hash : '';
  }

  static mapToBlockObjects(blocks: any): Block[] {
    return blocks.map((item: any) => new Block(
      item.previousHash,
      item.transaction,
      item.timeStamp
    ));
  }

  private static randomInteger(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
