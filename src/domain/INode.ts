export interface INode {
    ip: string;
    port: number;
    publicKey: string;
    url: string;
    knownNodes?: INode[]
}