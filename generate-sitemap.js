/* RUN THIS SCRIPT BEFORE DEPLOYING:
  node generate-sitemap.js
*/

import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';

// We need 'createRequire' to import the JSON file in an ES Module environment
const require = createRequire(import.meta.url);
const serviceAccount = require('./service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const BASE_URL = 'https://pahnawabanaras.com'; // Your real domain

const staticPages = [
  '',
  '/shop',
  '/about',
  '/contact',
  '/returns',
  '/privacy',
  '/login'
];

async function generateSitemap() {
  console.log('🔄 Fetching Products from Firestore...');
  
  const productsSnap = await db.collection('products').get();
  const productUrls = [];

  productsSnap.forEach(doc => {
    // Dynamic URL for each product
    productUrls.push(`/product/${doc.id}`);
  });

  console.log(`✅ Found ${productUrls.length} products.`);

  const allUrls = [...staticPages, ...productUrls];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${url.includes('/product/') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url === '' ? '1.0' : url.includes('/product/') ? '0.8' : '0.5'}</priority>
  </url>`).join('')}
</urlset>`;

  // Write to the public folder so it's accessible at pahnawabanaras.com/sitemap.xml
  // Ensure the public directory exists
  if (!fs.existsSync('./public')){
      fs.mkdirSync('./public');
  }
  fs.writeFileSync('./public/sitemap.xml', sitemapContent);
  
  console.log('🚀 sitemap.xml generated successfully in /public folder!');
}

generateSitemap().catch(console.error);