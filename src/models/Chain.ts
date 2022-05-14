import cp from 'child_process';
import path from 'path';
import crypto from 'crypto'

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

  private async callMiner(block: Block): Promise<Block> {
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

  createBlock(
    signedTransactionList: ISignedTransaction[],
    coinbaseAmount: number = 50
  ): Block {
    const coinbase: ICoinbase = {
      amount: coinbaseAmount,
      receiver: Wallet.instance.publicKey
    };

    const merkleRoot =  Chain.computeMerkleRoot(signedTransactionList);
    const block = new Block(
      this.lastHash,
      coinbase,
      merkleRoot,
      signedTransactionList
    );

    return block;
  }

  async mineBlock(signedTransactionList: ISignedTransaction[]): Promise<Block> {
    const block = this.createBlock(signedTransactionList);
    logMiningStarted();
    const minedBlock = await this.callMiner(block);

    return minedBlock;
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
      block.merkleRoot,
      block.signedTransactionList,
      block.nonce,
      block.timestamp
    ))

    return result;
  }

  static computeMerkleRoot(signedTransactionList: ISignedTransaction[]): string {
    if (signedTransactionList.length === 0) return '';
    const hashes = signedTransactionList.map(t => sha256(JSON.stringify(t)));
    return merkleRoot(hashes);
  }
}

/**
 * Calculate the merkel root for the given array of hashes.
 */
function merkleRoot(hashes: string[]): string {
  if (hashes.length === 0) throw Error("No transactions...");
  if (hashes.length === 1) return sha256(hashes[0]);
  const pairs = pairer(hashes);
  const nHashes = pairs.map(p => sha256(p.reduce((prev, cur) => prev + cur, "")));
  return merkleRoot(nHashes);
}

function sha256(content: string): string {
  const hash = crypto.createHash("SHA256");
  hash.update(content).end();
  return hash.digest("hex");
}

/**
 * Group elements in the `sequence` into pairs.
 * If the number of elements in the `sequence` is uneven,
 * the last element will be paired with itself.
 */
function pairer<T>(sequence: T[]): T[][] {
  let ar: T[][] = [];
  let result = sequence.reduce((result, _value, index, array) => {
    if (index % 2 === 0)
      result.push(array.slice(index, index + 2));
    return result;
  }, ar);
  if (result.length === 0) return [];
  const lastElement = result[result.length - 1];
  if (lastElement.length === 1) {
    lastElement.push(lastElement[0]);
  }
  return result;
}
