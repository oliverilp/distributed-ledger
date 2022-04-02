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

Running `npm run dev` will open up an interactive CLI where the following commands can be used:

* `add`

For example:

```
npm run dev                 

> distributed-ledger@1.0.0 dev
> tsc && npm run start


> distributed-ledger@1.0.0 start
> node dist/ui.js

Nodes                    Blocks
┌───────────────────────┐┌──────────────────────────────────────────┐
│ 127.0.0.1:10000       ││ 138bd89286d9fa9d4124e013d0a9ab49d1ebd49… │
│ 127.0.0.1:12345       ││ 0005c642dba842f8635194b5de265977fb850f0… │
│ 127.0.0.1:1200        ││ 96fd3fb70581213fc0ad2fd21f48364097877a2… │
└───────────────────────┘└──────────────────────────────────────────┘
Enter a command:  
```
