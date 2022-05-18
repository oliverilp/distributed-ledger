# Distributed ledger

A distributed ledgre impelemented in TypeScript and containerized with Docker.

## Setup

NB! Make sure you are running node.js 16 or higher. The code uses syntax not present in older node.js versions and shows a SyntaxError on node.js 14 and below.

```sh
git clone git@github.com:oliverilp/distributed-ledger.git
cd distributed-ledger
npm install
npm run dev
```
## Interaction with the application

Running `npm run dev` will open up an interactive console GUI

To specify a port add an argument to the end.

```
Your balance is 100₿ 

Nodes                   Blocks
┌──────────────────────┐┌─────────────────────────────────────────────────────┐
│ 127.0.0.1:10000  50₿ ││ 00008bb53ba6d256ea3c40fc3b9584f0cc0670c7b2c58d5f27… │
│                      ││ 0000be0f9308fb9ea38dde26774e036053d718a54a19833d4d… │
│                      ││ 00008d26338e9c5b51c95f5b447cf8c61d932190ea87fc15bf… │
└──────────────────────┘└─────────────────────────────────────────────────────┘
Choose an action:
❯ Add empty block
  Send money
```
