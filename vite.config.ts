import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    hydrogen(),
    oxygen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  ssr: {
    external: [
      'nodemailer',
      '@google-cloud/firestore',
      '@google-cloud/storage',
      'pg',
    ],
    optimizeDeps: {
      include: [
        'geolib',
        'typographic-base',
        'void-elements',
        'accept-language-parser',
        'fast-deep-equal',
        'fast-deep-equal/react',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'clsx',
      '@headlessui/react',
      'typographic-base',
      'react-intersection-observer',
    ],
  },
  build: {
    rollupOptions: {
      external: [
        '@google-cloud/firestore',
        '@google-cloud/storage',
        'pg',
      ],
    },
  },
});
