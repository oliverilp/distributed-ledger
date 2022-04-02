import { uiSetNodes } from "../ui";

export class Node {
  private static _nodes: Node[] = [];

  constructor(public ip: string, public port: number) { }

  static get nodes() {
    return this._nodes;
  }

  static set nodes(nodes: Node[]) {
    this._nodes = nodes;
    uiSetNodes(Node.nodes)
  }

  get url(): string {
    return `http://${this.ip}:${this.port}`;
  }

  static contains(node: Node, nodes: Node[]): boolean {
    return nodes.some((item) => item.url === node.url);
  }

  static mergeNodes(oldNodes: Node[], newNodes: Node[], port: number): Node[] {
    const filtered = newNodes.filter(
      (node) => !Node.contains(node, oldNodes) && node.port !== port
    );
    return [...oldNodes, ...filtered];
  }

  static mapToNodeObjects(nodes: any): Node[] {
    return nodes.map((item: any) => new Node(item.ip, item.port));
  }
}
