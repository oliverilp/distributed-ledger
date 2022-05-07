import * as crypto from 'crypto';
import { ITransactionDto } from '../domain/ITransactionDto';
import Transaction from './transaction';

export default class Wallet {
  public static instance = new Wallet();

  public publicKey: string;
  public privateKey: string;

  constructor(publicKey?: string, privateKey?: string) {
    if (publicKey && privateKey) {
      this.publicKey = publicKey;
      this.privateKey = privateKey;
      return;
    }

    const keypair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;
  }

  get json() {
    return { publicKey: this.publicKey }
  }

  createTransaction(amount: number, receiverPublicKey: string): ITransactionDto {
    const transaction = new Transaction(amount, this.publicKey, receiverPublicKey);

    const sign = crypto.createSign('SHA256');
    sign.update(transaction.toString()).end();
    const signature = sign.sign(this.privateKey);

    return {
      transaction,
      signature
    }
  }
}
