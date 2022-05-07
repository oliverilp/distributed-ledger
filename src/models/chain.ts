import { IBlock } from '../domain/IBlock';
import { IChain } from '../domain/IChain';
import { uiSetBlocks } from '../ui';
import { Block } from "./block";
import Transaction from "./transaction";

export class Chain implements IChain {
  public static instance = new Chain();

  private _blocks: Block[] = [];

  get blocks() {
    return this._blocks;
  }

  set blocks(blocks: Block[]) {
    this._blocks = blocks;
    uiSetBlocks(this.blocks);
  }

  constructor() {
    this._blocks = [
      // Genesis block
      new Block('', new Transaction(100, 'genesis', 'satoshi'))
    ];
  }

  get lastBlock() {
    return this._blocks[this._blocks.length - 1];
  }

  mine(block: Block) {
    console.log('⛏️  mining...')

    while (true) {
      if (block.hash.startsWith('00000')) {
        console.log(`Solved: ${block.nonce}`);
        console.log(block.hash);
        return block.nonce;
      }

      block.nonce += 1;
    }
  }

  addBlock(transaction: Transaction) {
    const block = new Block(this.lastBlock.hash, transaction);
    this.mine(block);

    this.blocks = [...this._blocks, block];
  }

  get copy() {
    const object = JSON.parse(JSON.stringify(this));
    object.blocks = object._blocks;
    delete object._blocks;
    object.lastBlock = JSON.parse(JSON.stringify(this.lastBlock));
    
    return object;
  }

  get json() {
    return JSON.stringify(this.copy);
  }

  static mapToChainObject(chain: IChain): Chain {
    const result = new Chain();

    result._blocks = chain.blocks.map((block: IBlock) => new Block(
      block.previousHash,
      block.transaction,
      block.timestamp
    ))

    return result;
  }
}