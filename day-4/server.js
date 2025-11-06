
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  if (path === '/echo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(req.headers, null, 2));
  }


  else if (path === '/slow') {
    const delay = parseInt(parsedUrl.query.ms) || 1000;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Responded after ${delay} ms`);
    }, delay);
  }


  else if (path === '/cache') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=30',
      'ETag': '"myetag123"'
    });
    res.end('This response is cacheable for 30 seconds.');
  }


  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
