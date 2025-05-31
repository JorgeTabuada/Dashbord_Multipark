// pages/_app.tsx
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Dashboard Multipark - Sistema Multi-Database</title>
        <meta name="description" content="Dashboard integrado com duas bases de dados Supabase para gestão completa da Multipark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Meta tags para SEO */}
        <meta property="og:title" content="Dashboard Multipark" />
        <meta property="og:description" content="Sistema multi-database para gestão operacional e RH" />
        <meta property="og:type" content="website" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      
      <Component {...pageProps} />
    </>
  );
}