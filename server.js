const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// In-memory mock cart
let cart = {
  token: 'mock-cart-token-12345',
  note: '',
  attributes: {},
  original_total_price: 6995,
  total_price: 6995,
  total_discount: 0,
  total_weight: 0,
  item_count: 1,
  items: [
    {
      id: 41805168410848,
      title: 'Post-Surgery Recovery Shorts - Black / M',
      price: 6995,
      line_price: 6995,
      quantity: 1,
      sku: 'JWEAR-SHORTS-BLK-M',
      grams: 100,
      vendor: 'JwearStudio',
      product_id: 85713813852,
      featured_image: {
        url: '/assets/products/shorts/short_main_black.jpg'
      }
    }
  ],
  requires_shipping: true,
  currency: 'EUR'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = req.url.split('?')[0];

  // Mock Shopify Cart API endpoints
  if (urlPath === '/cart.js' || urlPath === '/cart.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cart));
    return;
  }

  if (urlPath === '/cart/add.js' || urlPath === '/cart/add') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: 41805168410848,
      quantity: 1,
      title: 'Post-Surgery Recovery Shorts',
      price: 6995
    }));
    return;
  }

  if (urlPath === '/cart/change.js' || urlPath === '/cart/update.js') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cart));
    return;
  }

  if (urlPath === '/cart/clear.js') {
    cart.items = [];
    cart.item_count = 0;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(cart));
    return;
  }

  if (urlPath === '/recommendations/products.json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ products: [] }));
    return;
  }

  // Route mapping
  let safePath = urlPath;
  if (urlPath === '/' || urlPath === '/pages/usahatebrashatebraless') {
    safePath = '/index.html';
  } else if (urlPath === '/products/seamlessbra' || urlPath === '/products/post-surgery-recovery-shorts') {
    safePath = '/products/seamlessbra.html';
  } else if (urlPath === '/bodysuit' || urlPath === '/bodysuit.html' || urlPath === '/products/bodysuit') {
    safePath = '/bodysuit.html';
  }

  let filePath = path.join(__dirname, safePath);

  // If path has no extension and doesn't exist, try appending .html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    if (fs.existsSync(filePath + '.html')) {
      filePath += '.html';
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html
      const indexPath = path.join(__dirname, 'index.html');
      fs.readFile(indexPath, (err2, data) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err3, content) => {
      if (err3) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Landing page: http://localhost:${PORT}/pages/usahatebrashatebraless`);
  console.log(`Product page: http://localhost:${PORT}/products/seamlessbra`);
});
