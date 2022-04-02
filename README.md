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

Running `npm run start` will open up an interactive dialogue where the following commands can be used:

* `add`

For example:

```
npm run start                 

> distributed-server-lab@1.0.0 start
> npm run build && node dist/app.js


> distributed-server-lab@1.0.0 build
> tsc -p .

Using local port: 10000

Enter a command: nodes
Known nodes:
[]

Enter a command: blocks
Blocks:
[]

Enter a command: add block
Added new block:
{
  previousHash: '',
  transaction: '79 €',
  timeStamp: 1647989752383,
  hash: '14172d25b93bfecaf78e0002eed78a756f24ec84ca3fae12bf13b057aa4fdf52'
}

Enter a command: blocks
Blocks:
[
  Block {
    previousHash: '',
    transaction: '79 €',
    timeStamp: 1647989752383
  }
]
```
