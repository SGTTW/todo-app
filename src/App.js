import React from 'react';
import { ChakraProvider, Box, theme } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';
import Todos from './components/Todos';

// import { Logo } from './Logo';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box fontSize="xl">
        {/* <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Logo h="40vmin" pointerEvents="none" />
            <Text>
              Edit <Code fontSize="xl">src/App.js</Code> and save to reload.
            </Text>
            <Link
              color="teal.500"
              href="https://chakra-ui.com"
              fontSize="2xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn Chakra
            </Link>
          </VStack>
        </Grid> */}
        <ColorModeSwitcher justifySelf="flex-end" />
        <Todos />
      </Box>
    </ChakraProvider>
  );
}

export default App;
