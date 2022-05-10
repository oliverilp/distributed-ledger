import { Chain } from "./Chain";

export class Balance {
  public static instance = new Balance();

  public map: Map<string, number> = new Map();
  public blockHash = '';

  updateEveryBalance() {
    for (const block of Chain.instance.blocks) {
      this.blockHash = block.hash;
      for (const signedTransaction of block.signedTransactionList) {
        const { amount, sender, receiver } = signedTransaction.transaction;
        this.map.set(sender, (this.map.get(sender) || 0) - amount);
        this.map.set(receiver, (this.map.get(receiver) || 0) + amount);
      }
    }

    console.log(this);
  }
}