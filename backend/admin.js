const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const PRODUCTS_FILE = '/app/backend/products.json';
const ADMIN_HTML = path.join(__dirname, '../frontend/admin.html');
const ADMIN_CSS = path.join(__dirname, '../frontend/admin-styles.css');

const server = http.createServer((req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(ADMIN_HTML, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.url === '/admin-styles.css' && req.method === 'GET') {
    fs.readFile(ADMIN_CSS, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
  } else if (req.url === '/products' && req.method === 'GET') {
    fs.readFile(PRODUCTS_FILE, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      }
    });
  } else if (req.url === '/add' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const newProduct = JSON.parse(body);
      fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) throw err;
        const products = JSON.parse(data);
        newProduct.id = products.length + 1;
        products.push(newProduct);
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
          if (err) throw err;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Product added' }));
        });
      });
    });
  } else if (req.url === '/edit' && req.method === 'PUT') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const updatedProduct = JSON.parse(body);
      fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) throw err;
        const products = JSON.parse(data);
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          products[index] = updatedProduct;
          fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
            if (err) throw err;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Product updated' }));
          });
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Product not found' }));
        }
      });
    });
  } else if (req.url === '/delete' && req.method === 'DELETE') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { id } = JSON.parse(body);
      fs.readFile(PRODUCTS_FILE, (err, data) => {
        if (err) throw err;
        let products = JSON.parse(data);
        products = products.filter(p => p.id !== id);
        fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), err => {
          if (err) throw err;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Product deleted' }));
        });
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Admin panel running on http://localhost:${PORT}`);
});