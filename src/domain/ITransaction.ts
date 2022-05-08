export interface ITransaction {
  amount: number;
  sender: string; // public key
  receiver: string; // public key
  timestamp: string;
}