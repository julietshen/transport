import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { AppProps } from 'next/app';
import { LanguageProvider } from '../translations/LanguageContext';
import { ResourceProvider } from '../context/ResourceContext';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  styles: {
    global: {
      body: {
        transitionProperty: 'all',
        transitionDuration: 'normal',
      },
    },
  },
  colors: {
    brand: {
      50: '#f0e4ff',
      100: '#cbb2ff',
      200: '#a480ff',
      300: '#7c4dff',
      400: '#541aff',
      500: '#3b00e6',
      600: '#2e00b4',
      700: '#210082',
      800: '#140051',
      900: '#070021',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <LanguageProvider>
        <ResourceProvider>
          <Component {...pageProps} />
        </ResourceProvider>
      </LanguageProvider>
    </ChakraProvider>
  );
} 