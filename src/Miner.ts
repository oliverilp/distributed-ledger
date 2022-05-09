import { Block } from "./models/Block";

process.on('message', (msg: string) => {
  const block = Block.mapToBlockObject(JSON.parse(msg));

  while (!block.hash.startsWith('00000')) {
    block.nonce += 1;
  }

  if (process.send) {
    process.send(block.json);
    process.exit(0);
  }
});
