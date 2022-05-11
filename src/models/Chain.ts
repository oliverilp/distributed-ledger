import cp from 'child_process';
import path from 'path';

import { IBlock } from '../domain/IBlock';
import { IChain } from '../domain/IChain';
import { ICoinbase } from '../domain/ICoinbase';
import { ISignedTransaction } from '../domain/ISignedTransaction';
import { logMiningStarted } from '../Logger';
import { uiSetBlocks, uiSetNodes } from '../UI';
import { Balance } from './Balance';
import { Block } from "./Block";
import { Node } from './Node';
import Wallet from './Wallet';

export class Chain implements IChain {
  private static _instance = new Chain();
  private _blocks: Block[] = [];
  private child: cp.ChildProcess | null = null;

  public static get instance() {
    return this._instance;
  }

  public static set instance(chain: Chain) {
    this._instance = chain;
    Balance.instance.updateEveryBalance();
    uiSetBlocks(this.instance.blocks);
    if (Node.instance) {
      uiSetNodes(Node.instance.knownNodes);
    }
  }

  get blocks() {
    return this._blocks;
  }

  set blocks(blocks: Block[]) {
    this._blocks = blocks;
    Balance.instance.updateEveryBalance();
    uiSetBlocks(this.blocks);
    if (Node.instance) {
      uiSetNodes(Node.instance.knownNodes);
    }
  }

  get lastHash() {
    return this.blocks[this.blocks.length - 1]?.hash || '';
  }

  async mine(block: Block): Promise<Block> {
    this.killChild();
    return new Promise<Block>((resolve, reject) => {
      this.child = cp.fork(path.join(__dirname, '../Miner.js'));
      this.child.send(block.json);

      this.child.on('message', (msg: string) => {
        const minedBlock = Block.mapToBlockObject(JSON.parse(msg));
        resolve(minedBlock);
      });
    });
  }

  async createBlock(signedTransactionList: ISignedTransaction[]): Promise<Block> {
    const coinbase: ICoinbase = {
      amount: 50,
      receiver: Wallet.instance.publicKey
    };
    const block = new Block(this.lastHash, coinbase, signedTransactionList);
    logMiningStarted();
    const minedBlock = await this.mine(block);

    return minedBlock;
  }

  addFakeBlock(signedTransactionList: ISignedTransaction[]) {
    const coinbase: ICoinbase = {
      amount: 50,
      receiver: Wallet.instance.publicKey
    };
    const block = new Block(this.lastHash, coinbase, signedTransactionList);
    this._blocks = [...this._blocks, block];
  }

  // TODO: Reject promise
  killChild() {
    if (this.child) {
      this.child.kill();
    }
  }

  get copy(): Chain {
    const chain = new Chain();
    chain._blocks = JSON.parse(JSON.stringify(this.blocks));
    return chain;
  }

  get copyObject(): IChain {
    return {
      blocks: this.blocks.map(block => block.copy),
      lastHash: this.lastHash
    }
  }

  get json() {
    return JSON.stringify(this.copyObject);
  }

  static mapToChainObject(chain: IChain): Chain {
    const result = new Chain();

    result._blocks = chain.blocks.map((block: IBlock) => new Block(
      block.previousHash,
      block.coinbase,
      block.signedTransactionList,
      block.nonce,
      block.timestamp
    ))

    return result;
  }
}