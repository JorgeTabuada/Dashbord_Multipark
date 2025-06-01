/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configurações para PWA (opcional)
  experimental: {
    appDir: false // Usar pages router por agora
  },
  
  // Configurações de imagem
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'supabase.co',
      'avatars.githubusercontent.com'
    ]
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ]
  }
}

module.exports = nextConfig