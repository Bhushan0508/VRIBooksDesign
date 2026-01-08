# Permanent Links Setup for Book Details Pages

This guide explains how to create and manage permanent, shareable links for book detail pages in the Worldwide Publication application.

## Current Setup

The application is configured as a **Single Page Application (SPA)** using:
- **React Router** for client-side routing
- **Vite** as the build tool
- **Dynamic route**: `/bookDetail/:sku`

## How Permanent Links Work

### 1. **URL Format**

The permanent link format for book details pages is:

```
https://www.vridhamma.org/bookDetail/{SKU}
```

**Examples:**
- `https://www.vridhamma.org/bookDetail/E03` - Art of Living (English)
- `https://www.vridhamma.org/bookDetail/M01` - Art of Living (Marathi)
- `https://www.vridhamma.org/bookDetail/Sp02` - Art of Living (Spanish)
- `https://www.vridhamma.org/bookDetail/H66` - Jine ki kala (Hindi)

### 2. **How It Works**

When a user visits a permanent link like `/bookDetail/E03`:

1. **Client-side routing** (React Router) intercepts the request
2. **BookDetails component** receives the SKU from URL parameters
3. **Data is fetched** from the API using the SKU
4. **Page is rendered** with the book information
5. **Browser history** maintains the URL state

## Using the Book Link Utilities

The application provides a utility module for generating permanent links:

### Import the Module

```javascript
import { 
  getBookDetailUrl,
  getBookDetailRoute,
  getShareUrls,
  openShareUrl,
  copyBookLinkToClipboard,
  getQRCodeUrl,
  getBookDetailUrlWithParams
} from '@/utils/bookLinks'
```

### Generate Permanent URLs

#### Get Full Production URL
```javascript
const sku = 'E03'
const url = getBookDetailUrl(sku)
// Returns: https://www.vridhamma.org/bookDetail/E03
```

#### Get React Router Route (for internal navigation)
```javascript
const route = getBookDetailRoute(sku)
// Returns: /bookDetail/E03

// Use with React Router Link
<Link to={getBookDetailRoute(book.SKU)}>
  {book.Title}
</Link>
```

#### Get Social Media Share URLs
```javascript
const book = { 
  SKU: 'E03', 
  Title: 'Art of Living (Paperback, English)',
  Author: 'William Hart'
}

const shareUrls = getShareUrls(book)
// Returns object with URLs for:
// - facebook
// - twitter
// - whatsapp
// - email
// - linkedin
// - pinterest
// - reddit
```

#### Copy Link to Clipboard
```javascript
async function copyLink(sku) {
  const success = await copyBookLinkToClipboard(sku)
  if (success) {
    alert('Link copied to clipboard!')
  }
}
```

#### Open Share Dialog
```javascript
const handleShare = (platform, book) => {
  openShareUrl(platform, book)
  // Opens WhatsApp, Email, Twitter, etc. share dialog
}
```

#### Generate QR Code URL
```javascript
const qrUrl = getQRCodeUrl('E03')
// Use with QR code generator library
// Example: https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={qrUrl}
```

#### Add Query Parameters
```javascript
const urlWithParams = getBookDetailUrlWithParams('E03', {
  lang: 'en',
  ref: 'social',
  campaign: 'spring2024'
})
// Returns: https://www.vridhamma.org/bookDetail/E03?lang=en&ref=social&campaign=spring2024
```

## Implementation Examples

### Example 1: Add Copy Link Button to Book Details

```javascript
import { copyBookLinkToClipboard, getBookDetailUrl } from '@/utils/bookLinks'

function BookDetails() {
  const handleCopyLink = async () => {
    const success = await copyBookLinkToClipboard(book.SKU)
    if (success) {
      alert('Link copied: ' + getBookDetailUrl(book.SKU))
    }
  }

  return (
    <button onClick={handleCopyLink}>
      📋 Copy Link
    </button>
  )
}
```

### Example 2: Share on Multiple Platforms

```javascript
import { getShareUrls } from '@/utils/bookLinks'

function ShareButtons({ book }) {
  const shareUrls = getShareUrls(book)
  const platforms = ['facebook', 'twitter', 'whatsapp', 'email', 'linkedin']

  return (
    <div className="share-buttons">
      {platforms.map(platform => (
        <a 
          key={platform}
          href={shareUrls[platform]}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on {platform}
        </a>
      ))}
    </div>
  )
}
```

### Example 3: Generate QR Code

```javascript
import { getQRCodeUrl } from '@/utils/bookLinks'

function BookQRCode({ sku }) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getQRCodeUrl(sku))}`

  return (
    <div>
      <h3>Scan to View Book</h3>
      <img src={qrCodeUrl} alt="Book QR Code" />
    </div>
  )
}
```

### Example 4: Navigation with Preserved State

```javascript
import { Link } from 'react-router-dom'
import { getBookDetailRoute } from '@/utils/bookLinks'

function BookCard({ book, allBooks }) {
  return (
    <Link 
      to={getBookDetailRoute(book.SKU)}
      state={{ book, allBooks }}
    >
      <img src={book.Images?.[0]} alt={book.Title} />
      <h3>{book.Title}</h3>
    </Link>
  )
}
```

## Server Configuration (Production)

### For Apache Servers

Create a `.htaccess` file in the root directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Exclude actual files and directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  
  # Rewrite all requests to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

### For Nginx

Add this to your Nginx configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### For Node.js / Express

```javascript
const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### For Vercel / Netlify

These platforms automatically handle SPA routing. Just ensure:
- Build command: `npm run build`
- Output directory: `dist`

Netlify specific (add to `netlify.toml`):
```toml
[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

## SEO Considerations

For better SEO with dynamic routes, consider adding:

### 1. Meta Tags with React Helmet

```javascript
import { Helmet } from 'react-helmet'

function BookDetails({ book }) {
  return (
    <>
      <Helmet>
        <title>{book.Title} - Worldwide Publication</title>
        <meta name="description" content={book.Description?.substring(0, 160)} />
        <meta name="keywords" content={`${book.Title}, ${book.Author}, ${book.Language}`} />
        <link rel="canonical" href={getBookDetailUrl(book.SKU)} />
        
        {/* Open Graph for Social Sharing */}
        <meta property="og:title" content={book.Title} />
        <meta property="og:description" content={book.Description?.substring(0, 160)} />
        <meta property="og:image" content={book.Images?.[0]} />
        <meta property="og:url" content={getBookDetailUrl(book.SKU)} />
        <meta property="og:type" content="website" />
      </Helmet>
      {/* Component JSX */}
    </>
  )
}
```

### 2. Sitemap Generation

Create a script to generate `sitemap.xml`:

```javascript
// scripts/generate-sitemap.js
const fs = require('fs');
const axios = require('axios');

async function generateSitemap() {
  try {
    const response = await axios.get('https://www.vridhamma.org/api/get-books-info');
    const books = response.data;

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.vridhamma.org/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${books.map(book => `
  <url>
    <loc>https://www.vridhamma.org/bookDetail/${book.SKU}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

    fs.writeFileSync('public/sitemap.xml', sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap();
```

## Testing Permanent Links

### Test Locally
```bash
npm run dev
# Visit: http://localhost:5173/bookDetail/E03
```

### Test Production Build
```bash
npm run build
npm run preview
# Visit: http://localhost:4173/bookDetail/E03
```

## Troubleshooting

### Issue: 404 Error on Direct Visit to `/bookDetail/E03`

**Solution:** Ensure your server is configured to serve `index.html` for all routes (see Server Configuration above).

### Issue: URLs Not Working on Production

**Checklist:**
1. ✅ Verify `.htaccess` or Nginx config is correct
2. ✅ Check that API proxy is working (`/api/get-books-info`)
3. ✅ Ensure build artifacts are in correct directory
4. ✅ Test with network tab open in DevTools

### Issue: Book Data Not Loading

**Debug steps:**
1. Open browser DevTools → Network tab
2. Check if `/api/get-books-info` request succeeds
3. Verify API response contains the SKU you're accessing
4. Check browser console for errors

## Summary

✅ **Permanent links are already set up and working!**

Key features:
- Dynamic routes: `/bookDetail/:sku`
- Production URLs: `https://www.vridhamma.org/bookDetail/{SKU}`
- Utility functions for link generation
- Share functionality for social media
- QR code support
- Query parameter support for tracking

Use the utility functions from `src/utils/bookLinks.js` to generate links throughout your application.
