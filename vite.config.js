import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    middlewares: [
      // Custom middleware for share link API
      {
        apply: 'serve',
        handle(req, res, next) {
          if (req.url.startsWith('/api/share-link')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const sku = url.searchParams.get('sku');
            const platform = url.searchParams.get('platform');
            
            if (!sku) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'SKU is required' }));
              return;
            }

            // Get current domain from request headers
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            const host = req.headers['x-forwarded-host'] || req.headers.host;
            const currentDomain = `${protocol}://${host}`;

            // Generate the share link with tracking using current domain
            const shareLink = `${currentDomain}/bookDetail/${sku}?utm_source=${platform || 'direct'}&utm_medium=social&utm_campaign=book_share`;
            
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: true,
              sku,
              platform: platform || 'direct',
              shareLink,
              shortLink: `${currentDomain}/bookDetail/${sku}`,
              currentDomain
            }));
            return;
          }
          next();
        }
      }
    ],
    proxy: {
      '/api': {
        target: 'https://www.vridhamma.org',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
    // Enable SPA fallback routing
    middlewareMode: false
  },
  // Configure build for proper SPA routing
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})