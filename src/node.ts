export class Node {
  ip: string;
  port: number;
  static nodes: Node[] = [];

  get url(): string {
    return `http://${this.ip}:${this.port}`;
  }

  constructor(ip: string, port: number) {
    this.ip = ip;
    this.port = port;
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
