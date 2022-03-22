import * as crypto from 'crypto';

export class Block {
  static blocks: Block[] = [];

  constructor(
    public previousHash: string = Block.lastHash,
    public transaction: string = `${Block.randomInteger()} €`,
    public timeStamp = Date.now()
  ) {}

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

  private static randomInteger(min = 1, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
