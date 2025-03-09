import { Html, Head, Main, NextScript } from 'next/document';
import Document from 'next/document';

// Create a separate style component to avoid the title warning
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      /* Global RTL support */
      html[dir="rtl"] .chakra-stack--row {
        flex-direction: row-reverse;
      }
      
      /* Font support for multiple languages */
      :lang(ar) {
        font-family: 'Noto Sans Arabic', sans-serif;
      }
      
      :lang(he) {
        font-family: 'Noto Sans Hebrew', sans-serif;
      }
      
      body {
        font-family: 'Noto Sans', sans-serif;
      }
    `
  }} />
);

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Font Awesome CDN */}
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
            integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer" 
          />
          
          {/* Add fonts that support Arabic and Hebrew scripts */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Arabic:wght@400;700&family=Noto+Sans+Hebrew:wght@400;700&display=swap" 
            rel="stylesheet"
          />
        </Head>
        <body>
          <GlobalStyles />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
} 