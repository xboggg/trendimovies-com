#!/usr/bin/env node
/**
 * Ping Search Engines with Sitemap using IndexNow
 * Notifies Bing, Yandex, and others when content is updated
 */

const SITE_URL = 'https://trendimovies.com';
const SITEMAP_URL = 'https://trendimovies.com/sitemap.xml';

// IndexNow key - create a file at /public/{key}.txt with the key as content
const INDEXNOW_KEY = 'trendimovies2024indexnow';

async function pingIndexNow(urls = []) {
  // If no specific URLs, just ping the sitemap
  const urlList = urls.length > 0 ? urls : [SITEMAP_URL];

  const payload = {
    host: 'trendimovies.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urlList
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow'
  ];

  console.log('Pinging IndexNow endpoints...');
  console.log(`URLs to index: ${urlList.length}`);
  console.log('');

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const name = endpoint.includes('bing') ? 'Bing' : 'IndexNow';

      if (response.ok || response.status === 200 || response.status === 202) {
        console.log(`✓ ${name}: Submitted successfully (status ${response.status})`);
      } else {
        const text = await response.text().catch(() => '');
        console.log(`✗ ${name}: Failed (status ${response.status}) ${text}`);
      }
    } catch (error) {
      const name = endpoint.includes('bing') ? 'Bing' : 'IndexNow';
      console.log(`✗ ${name}: Error - ${error.message}`);
    }
  }

  console.log('');
  console.log('Done!');
}

// Get URLs from command line args or use default
const args = process.argv.slice(2);
pingIndexNow(args);
