import * as crypto from 'crypto';

export class Block {
  static blocks: Block[] = [];

  constructor(
    public prevHash: string,
    public transaction: string,
    public ts = Date.now()
  ) {}

  get hash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }

  get lastBlock() {
    return Block.blocks[Block.blocks.length - 1];
  }

  addBlock() {
     
  }
}
