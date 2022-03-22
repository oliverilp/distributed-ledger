import * as crypto from 'crypto';

export class Block {
  static blocks: Block[] = [];

  constructor(
    public prevHash: string = Block.lastHash,
    public transaction: string = `${Block.randomInteger()} €`,
    public timeStamp = Date.now()
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("MD5");
    hash.update(str).end();
    return hash.digest("hex");
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
