import cp from 'child_process';
import path from 'path';

import { IBlock } from '../domain/IBlock';
import { IChain } from '../domain/IChain';
import { ICoinbase } from '../domain/ICoinbase';
import { ISignedTransaction } from '../domain/ISignedTransaction';
import { uiSetBlocks } from '../ui';
import { Block } from "./block";
import Wallet from './wallet';

export class Chain implements IChain {
  public static instance = new Chain();

  private _blocks: Block[] = [];
  private child: cp.ChildProcess | null = null;

  get blocks() {
    return this._blocks;
  }

  set blocks(blocks: Block[]) {
    this._blocks = blocks;
    uiSetBlocks(this.blocks);
  }

  get lastHash() {
    return this.blocks[this.blocks.length - 1]?.hash || '';
  }

  async mine(block: Block): Promise<Block> {
    this.killChild();
    return new Promise<Block>((resolve, reject) => {
      this.child = cp.fork(path.join(__dirname, '../miner.js'));
      this.child.send(block.json);

      this.child.on('message', (msg: string) => {
        const minedBlock = Block.mapToBlockObject(JSON.parse(msg));
        resolve(minedBlock);
      });
    });
  }

  async addBlock(signedTransaction: ISignedTransaction): Promise<Block> {
    const coinbase: ICoinbase = {
      amount: 50,
      receiver: Wallet.instance.publicKey
    };
    const block = new Block(this.lastHash, coinbase, signedTransaction);
    const minedBlock = await this.mine(block);

    this.blocks = [...this._blocks, minedBlock];
    return minedBlock;
  }

  // TODO: Reject promise
  killChild() {
    if (this.child) {
      this.child.kill();
    }
  }

  get copy() {
    const object = JSON.parse(JSON.stringify(this));
    object.blocks = object._blocks;
    delete object._blocks;
    delete object.child;
    object.lastHash = JSON.parse(JSON.stringify(this.lastHash));

    return object;
  }

  get json() {
    return JSON.stringify(this.copy);
  }

  static mapToChainObject(chain: IChain): Chain {
    const result = new Chain();

    result._blocks = chain.blocks.map((block: IBlock) => new Block(
      block.previousHash,
      block.coinbase,
      block.signedTransaction,
      block.nonce,
      block.timestamp
    ))

    return result;
  }
}