import * as crypto from 'crypto';

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

  // sendMoney(amount: number, payeePublicKey: string) {
  //   const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

  //   const sign = crypto.createSign('SHA256');
  //   sign.update(transaction.toString()).end();

  //   const signature = sign.sign(this.privateKey);
  //   Chain.instance.addBlock(transaction, this.publicKey, signature);
  // }
}
