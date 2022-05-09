import { INode } from "../domain/INode";
import { uiSetNodes } from "../UI";

export class Node implements INode {
  public static instance: Node;
  private _knownNodes: INode[] = [];

  constructor(
    public ip: string,
    public port: number,
    public publicKey: string
  ) { }

  get knownNodes() {
    return this._knownNodes;
  }

  set knownNodes(nodes: INode[]) {
    this._knownNodes = nodes;
    uiSetNodes(this.knownNodes);
  }

  get url(): string {
    return `http://${this.ip}:${this.port}`;
  }

  get json() {
    const object = JSON.parse(JSON.stringify(this));
    object.url = this.url;
    delete object._knownNodes;
    object.knownNodes = JSON.parse(JSON.stringify(this._knownNodes));;
    object.knownNodes.forEach((node: INode) => delete node.knownNodes);
    return JSON.stringify(object);
  }

  static contains(node: INode, nodes: INode[]): boolean {
    return nodes.some((item) => item.url === node.url);
  }

  static mergeNodes(oldNodes: INode[], newNodes: INode[], port: number): INode[] {
    const filtered = oldNodes.filter(
      (node: INode) => !Node.contains(node, newNodes)
    );

    const output = [...filtered, ...newNodes.filter(node => node.port !== port)];
    return output;
  }
}
