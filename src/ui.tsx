import React, { useState } from 'react';
import { render, Box, Text, Newline } from 'ink';
import TextInput from 'ink-text-input';

import { runApp, sendMoney } from './app';
import { Block } from './models/block';
import SelectInput from 'ink-select-input/build';
import { INode } from './domain/INode';

runApp();

export let uiSetNodes: any;
export let uiSetBlocks: any;

const UI = () => {
  const [nodes, setNodes] = useState<INode[]>([]);
  uiSetNodes = setNodes;

  const [blocks, setBlocks] = useState([]);
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
    <>
      <Box flexDirection="row">
        <Box flexDirection="column" height="100%">
          <Text>
            Nodes
          </Text>
          <Box borderStyle="single" width={25}>
            <Text>
              {nodes.map(node =>
                <Text key={node.port}>
                  {nodes[0] === node ? null : <Newline />}
                  {` ${node.ip}:${node.port} `}
                </Text>
              )}
            </Text>
          </Box>
        </Box>
        <Box flexDirection="column" flexGrow={1} height="100%">
          <Text>
            Blocks
          </Text>
          <Box borderStyle="single" flexDirection="column">
            {blocks.map((block: Block) =>
              <Box key={block.hash} paddingX={1}>
                <Text key={block.hash} wrap="truncate">
                  {block.hash}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {tabs[index]}
    </>
  );
};

const ChooseAction = (props: any) => {
  const { nodes, setWallets, setIndex } = props;

  const handleSelect = (item: any) => {
    switch (item.value) {
      case 'addBlock':
        // addBlock();
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
      label: 'Add block',
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

const ChooseAmount = (props: {node: INode, setIndex: any}) => {
  const { node, setIndex } = props;
  const [value, setvalue] = useState('');

  const handleSubmit = () => {
    const amount = parseFloat(value);

    if (amount > 0) {
      setvalue('');
      setIndex(0);

      sendMoney(amount, node.publicKey);
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

render(<UI />);
