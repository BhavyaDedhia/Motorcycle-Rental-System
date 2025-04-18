import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="MotoCruise - Premium Motorcycle Rental Service" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 