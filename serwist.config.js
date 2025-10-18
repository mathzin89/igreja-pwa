// serwist.config.js
/**
 * @type {import('@serwist/build').RuntimeCachingEntry[]}
 */
const runtimeCaching = [
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https?:\/\/(\w+?\.)?firebase(storage)?\.googleapis\.com\/.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'firebase-assets-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-font-assets-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-image-assets-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:js)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-js-assets-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:css|less|scss|sass)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-style-assets-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
      },
    },
  },
  {
    urlPattern: /.*/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'others-cache',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
];

module.exports = {
  cacheOnNavigation: true, // Habilita cache de navegação
  reloadOnOnline: true, // Recarrega se ficar online após offline
  // swcMinify: true, // Pode ser útil, mas não estritamente necessário para PWA
  dest: 'public', // Onde o service worker será gerado
  disable: process.env.NODE_ENV === 'development', // Desabilita em dev para evitar cache indesejado
  skipWaiting: true, // Força o service worker a ativar imediatamente
  clientsClaim: true, // Força o service worker a assumir o controle dos clientes imediatamente
  runtimeCaching, // Nossas regras de cache
};