import React, { useState } from 'react';
import { render, Box, Text, Newline, Spacer } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input/build';

import { runApp, sendEmptyBlock, sendTransaction } from './App';
import { INode } from './domain/INode';
import { Balance } from './models/Balance';
import Wallet from './models/Wallet';
import { Color, IConsoleItem } from './domain/IConsoleItem';
import { IBlock } from './domain/IBlock';

export function uiAddConsoleLine(text: string, color: Color = Color.White) {
  const item: IConsoleItem = { text, color }
  uiSetConsoleItems([...uiConsoleItems, item]);
}

let uiConsoleItems: any;
let uiSetConsoleItems: any;
export let uiSetNodes: any;
export let uiSetBlocks: any;

const UI = () => {
  const [consoleItems, setConsoleItems] = useState<IConsoleItem[]>([]);
  uiConsoleItems = consoleItems;
  uiSetConsoleItems = setConsoleItems;

  const [nodes, setNodes] = useState<INode[]>([]);
  uiSetNodes = setNodes;

  const [blocks, setBlocks] = useState<IBlock[]>([]);
  uiSetBlocks = setBlocks;

  let [wallets, setWallets]: any = useState([]);
  let [node, setNode] = useState<INode>();

  let [index, setIndex] = useState(0);
  let tabs: JSX.Element[] = [
    <ChooseAction nodes={nodes} setWallets={setWallets} setIndex={setIndex} />,
    <ChooseNode wallets={wallets} setNode={setNode} setIndex={setIndex} />,
    <ChooseAmount node={node!} setIndex={setIndex} />
  ];

  return (
    <Box flexDirection="column" marginY={1}>
      <Box flexDirection="column" marginBottom={1}>
        {consoleItems.map((item, index) =>
          <Text key={index} color={item.color}>
            {item.text}
          </Text>
        )}
      </Box>
      <Text backgroundColor="white" color="black">
        {` Your balance is ${Balance.instance.getPretty(Wallet.instance.publicKey)} `}
      </Text>
      <Box flexDirection="column" marginTop={1}>
        <Box flexDirection="row">
          <Box flexDirection="column" width="30%">
            <Text>
              Nodes
            </Text>
            <Box borderStyle="single" flexDirection="column" flexGrow={1}>
              {nodes.map((node, index) =>
                <Box key={index} justifyContent="space-between">
                  <Text>{` ${node.ip}:${node.port}`}</Text>
                  <Text color="green">{`${Balance.instance.getPretty(node.publicKey)}`}</Text>
                </Box>
              )}
            </Box>
          </Box>
          <Box flexDirection="column" width="70%">
            <Text>
              Blocks
            </Text>
            <Box borderStyle="single" flexDirection="column" flexGrow={1}>
              {blocks.map((block, index) =>
                <Box key={index} paddingX={1} justifyContent="center">
                  <Text key={block.hash} wrap="truncate">
                    {block.hash}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {tabs[index]}
      </Box>
    </Box>
  );
};

const ChooseAction = (props: any) => {
  const { nodes, setWallets, setIndex } = props;

  const handleSelect = (item: any) => {
    switch (item.value) {
      case 'addBlock':
        sendEmptyBlock();
        break;
      case 'sendMoney':
        setWallets(nodes.map((node: any) => (
          {
            label: node.url, value: node, key: node.url
          }
        )));

        setIndex(1);
        break;
    }
  };

  const items = [
    {
      label: 'Add empty block',
      value: 'addBlock'
    },
    {
      label: 'Send money',
      value: 'sendMoney'
    }
  ];

  return (
    <Box flexDirection="column">
      <Box marginRight={1}>
        <Text>Choose an action:</Text>
      </Box>

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  )
}

const ChooseNode = (props: any) => {
  const { wallets, setNode, setIndex } = props;

  const handleSelect = (item: any) => {
    setNode(item.value);
    setIndex(2);
  };

  return (
    <Box flexDirection="column">
      <Box marginRight={1}>
        <Text>Choose who to send money to:</Text>
      </Box>

      <SelectInput items={wallets} onSelect={handleSelect} />
    </Box>
  )
}

const ChooseAmount = (props: { node: INode, setIndex: any }) => {
  const { node, setIndex } = props;
  const [value, setvalue] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(value);

    if (amount > 0) {
      setvalue('');
      setIndex(0);

      sendTransaction(amount, node.publicKey);
    }
  };

  const onChange = (value: string) => {
    setvalue(value.replace(/[^0-9.]/gi, ''));
  }

  return (
    <Box flexDirection="column">
      <Box marginRight={1}>
        <Text>Enter amount that will be sent to {node.url}:</Text>
      </Box>

      <TextInput value={value} onChange={onChange} onSubmit={handleSubmit} />
    </Box>
  )
}

if (!process.send) {
  console.clear();
  runApp();
  render(<UI />);
}
