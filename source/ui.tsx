import React, { useState } from 'react';
import { render, Box, Text, Newline } from 'ink';
import TextInput from 'ink-text-input';

import { addBlock, runApp } from './app';

runApp();

export let uiSetNodes: React.Dispatch<React.SetStateAction<any[]>>;
export let uiSetBlocks: React.Dispatch<React.SetStateAction<any[]>>;

const UI = () => {
  const [nodes, setNodes] = useState([]);
  uiSetNodes = setNodes;

  const [blocks, setBlocks] = useState([]);
  uiSetBlocks = setBlocks;

  const [command, setCommand] = useState('');

  const handleSubmit = () => {
    if (command.toLowerCase() == 'add') {
      addBlock();
    }

    setCommand('');
  };

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
            {blocks.map(block =>
              <Box key={block.hash} paddingX={1}>
                <Text key={block.hash} wrap="truncate">
                  {block.hash}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box>
        <Box marginRight={1}>
          <Text>Enter a command:</Text>
        </Box>

        <TextInput value={command} onChange={setCommand} onSubmit={handleSubmit} />
      </Box>
    </>
  );
};

render(<UI />);
