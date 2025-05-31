// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuração para suportar tanto a versão React quanto a HTML
  trailingSlash: true,
  
  // Permitir acesso aos ficheiros HTML estáticos
  async rewrites() {
    return [
      {
        source: '/legacy/:path*',
        destination: '/:path*', // Redireciona /legacy/index.html para /index.html
      },
    ];
  },
  
  // Configuração para ambiente de desenvolvimento
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  // Otimizações para o Supabase
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_SUPABASE_DASHBOARD_URL: process.env.NEXT_PUBLIC_SUPABASE_DASHBOARD_URL,
    NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_DASHBOARD_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL: process.env.NEXT_PUBLIC_SUPABASE_FERRAMENTAS_URL,
    NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_FERRAMENTAS_ANON_KEY,
  },
};

module.exports = nextConfig;