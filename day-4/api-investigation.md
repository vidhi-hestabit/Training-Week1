````markdown
# API Investigation Report — Day 4

---

## 🔹 Learning Outcomes
- Understand HTTP headers and manipulation
- Implement pagination with API requests
- Observe and work with ETag caching
- Comprehend request–response lifecycle
- Basic Node HTTP server creation

---

## 🔹 Setup

```bash
sudo apt update
sudo apt install curl dnsutils traceroute nodejs npm -y

# Verify installations
curl --version
nslookup --version
traceroute --version
node -v
npm -v
````
![alt text](<Screenshot from 2025-11-06 13-00-45.png>)


---

## 🔹 DNS and Network Forensics

### DNS Lookup

```bash
nslookup dummyjson.com
```
![alt text](<Screenshot from 2025-11-06 13-01-29.png>)
**Output:**

```
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	dummyjson.com
Address: 104.21.61.23
Name:	dummyjson.com
Address: 172.67.205.42
Name:	dummyjson.com
Address: 2606:4700:3033::6815:3d17
Name:	dummyjson.com
Address: 2606:4700:3031::ac43:cd2a
```

* Cloudflare hosts DummyJSON API
* Resolves both IPv4 and IPv6 addresses

### Traceroute

```bash
traceroute dummyjson.com
```

* Tracks network hops from your computer to the API server
* Useful for diagnosing latency or routing issues

---

## 🔹 CURL: Pagination & Verbose Requests

```bash
curl -v "https://dummyjson.com/products?limit=5&skip=10"
```
![alt text](<Screenshot from 2025-11-06 13-02-09.png>)

**Observations:**

* DNS resolution to IPs
* TCP connection to port 443
* TLS handshake using TLS 1.3
* GET request sent to `/products?limit=5&skip=10`
* Response returned with status `200 OK` and JSON data

---

## 🔹 Header Manipulation

### Remove User-Agent

```bash
curl -v -H "User-Agent:" "https://dummyjson.com/products?limit=5&skip=10"
```

* Result: `200 OK`
* DummyJSON ignores the `User-Agent` header


![alt text](<Screenshot from 2025-11-06 13-04-50.png>)

### Add Fake Authorization

```bash
curl -v -H "Authorization: Bearer faketoken123" "https://dummyjson.com/products?limit=5&skip=10"
```

* Public endpoint ignores Authorization
* Secure endpoints would reject fake tokens

![alt text](<Screenshot from 2025-11-06 13-05-21.png>)


**Header Manipulation Table**

| Command                          | Purpose             | Observation                    |
| -------------------------------- | ------------------- | ------------------------------ |
| `nslookup`                       | DNS resolution      | Domain → IP mapping            |
| `traceroute`                     | Trace network path  | Network hops visible           |
| `curl -v`                        | Basic HTTPS request | Full request/response cycle    |
| `curl -v -H "User-Agent:"`       | Header removal      | Server unaffected              |
| `curl -v -H "Authorization:..."` | Fake auth           | Public endpoints ignore header |

---

## 🔹 Caching & ETag

### Fetch headers only

```bash
curl -I https://dummyjson.com/products/1
```

![alt text](<Screenshot from 2025-11-06 13-06-19.png>)

* Displays HTTP metadata including `ETag` and `Cache-Control`

### Conditional Request using ETag

```bash
curl -v -H 'If-None-Match: W/"5e6-bX+IgjHKZz+TflDmEXfyyaBO9Hk"' https://dummyjson.com/products/1
```

* Response: `HTTP/2 304 Not Modified`
* Server confirms resource hasn’t changed — saves bandwidth
* Demonstrates HTTP caching mechanism

---

![alt text](<Screenshot from 2025-11-06 13-06-53.png>)

![alt text](<Screenshot from 2025-11-06 13-07-23.png>)



## 🔹 Node.js HTTP Server

**server.js**

```javascript
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // /echo → return headers
  if (path === '/echo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(req.headers, null, 2));
  }
  // /slow → delay response
  else if (path === '/slow') {
    const delay = parseInt(parsedUrl.query.ms) || 1000;
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(`Responded after ${delay} ms`);
    }, delay);
  }
  // /cache → return cache headers
  else if (path === '/cache') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=30',
      'ETag': '"myetag123"'
    });
    res.end('This response is cacheable for 30 seconds.');
  }
  // Default
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
```

### Testing

```bash
curl -v http://localhost:3000/echo

![alt text](<Screenshot from 2025-11-06 14-26-17.png>)

curl -v http://localhost:3000/slow?ms=3000

![alt text](<Screenshot from 2025-11-06 14-26-57.png>)

curl -v http://localhost:3000/cache

![alt text](<Screenshot from 2025-11-06 14-27-21.png>)


```

* `/echo` shows headers
* `/slow` delays response by specified milliseconds
* `/cache` demonstrates server caching using `Cache-Control` and `ETag`

---

## 🔹 Deliverables

1. **curl-lab.txt** – Saved CURL requests and responses
2. **api-investigation.md** – This report
3. **server.js** – Node HTTP server
4. **Screenshots** – POSTMAN requests (pagination, headers, caching)

---

## 🔹 Key Learnings

* Headers can be manipulated without affecting public endpoints
* ETag and caching headers improve efficiency
* Conditional HTTP requests reduce bandwidth usage
* Node.js can quickly simulate API endpoints for testing
* CURL provides deep visibility into HTTP request-response cycles

```