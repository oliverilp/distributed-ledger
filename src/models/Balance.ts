import { Chain } from "./Chain";

export class Balance {
  public static instance = new Balance();

  public map: Map<string, number> = new Map();
  public blockHash = '';

  updateEveryBalance(chain = Chain.instance) {
    this.map = new Map();
    for (const block of chain.blocks) {
      this.blockHash = block.hash;

      let { amount, receiver } = block.coinbase;
      this.addMoney(receiver, amount);
      for (const signedTransaction of block.signedTransactionList) {
        let { amount, sender, receiver } = signedTransaction.transaction;
        this.removeMoney(sender, amount);
        this.addMoney(receiver, amount);
      }
    }
  }

  addMoney(publicKey: string, amount: number) {
    this.map.set(publicKey, (this.map.get(publicKey) || 0) + amount);
  }

  removeMoney(publicKey: string, amount: number) {
    this.addMoney(publicKey, -amount);
  }

  get isValid() {
    for (const [_key, amount] of this.map) {
      if (amount < 0) return false;
    }
    return true;
  }

  get copy() {
    const balance = new Balance();
    balance.map = new Map(this.map);
    balance.blockHash = this.blockHash;
    return balance;
  }

  getPretty(publicKey: string) {
    return `${this.map.get(publicKey) || 0}₿`;
  }
}