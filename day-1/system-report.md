````markdown
# Day 1 Training - System Report

---

## 1. System Information

### OS Version
```bash
cat /etc/os-release
````

Result:

```
24.04.3
```
![alt text](<Screenshot from 2025-11-03 17-39-26.png>)

### Current Shell

```bash
echo $SHELL
```

Result:

```
/bin/bash
```
![alt text](<Screenshot from 2025-11-03 17-41-21.png>)

### Node Binary Path

```
/usr/bin/node
```
![alt text](<Screenshot from 2025-11-03 18-20-03.png>)

### Node.js Installation

```bash
sudo apt update
sudo apt install nodejs
node -v
```

Result:

```
v24.11.0
```

### NPM Global Installation Path

```bash
sudo apt install npm
npm root -g
```

Result:

```
/usr/local/lib/node_modules
```

---

## 2. Install and Use NVM

Install NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

Steps:

* Downloads NVM to `/home/vidhiajmera/.nvm`
* Appends NVM source string to `.bashrc`:

```bash
export NVM_DIR="$HOME/.nvm"
```

Verify installation:

```bash
nvm -v
```

Result:

```
0.39.1
```
![alt text](<Screenshot from 2025-11-03 18-20-20.png>)

Install Node.js via NVM:

```bash
nvm install v24.11.0
nvm alias default v24.11.0
nvm use v24.11.0
```
![alt text](<Screenshot from 2025-11-03 18-20-34.png>)


---

## 3. `introspect.js` Script

Create the script:

```bash
touch introspect.js
nano introspect.js
```

Add the following content:

```javascript
const os = require('os');
const path = require('path');

console.log('OS: ' + os.type());
console.log('Architecture: ' + os.arch());
console.log('CPU Cores: ' + os.cpus().length);
console.log('Total Memory: ' + (os.totalmem()) + ' GB');
console.log('System Uptime: ' + (os.uptime() / 3600).toFixed(2) + ' hours');
console.log('Current Logged User: ' + os.userInfo().username);
console.log('Node Path: ' + process.execPath);
```

Run the script:

```bash
node introspect.js
```

Output:

```
OS: Linux
Architecture: Linux
CPU Cores: 12
Total Memory: 24870019072 GB
System Uptime: 2.79 hours
Current Logged User: vidhiajmera
Node Path: /home/vidhiajmera/.nvm/versions/node/v24.11.0/bin/node
```

---

## 4. STREAM vs BUFFER Exercise

### Create Test File

```bash
fallocate -l 50M testfile.txt
ls -lh testfile.txt
```
![alt text](<Screenshot from 2025-11-03 19-08-22.png>)


### Node.js Benchmark Script

```javascript
const fs = require("fs");

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(2)} ${units[i]}`;
}

// Buffer-based read
function readFileUsingBuffer(filePath, callback) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  fs.readFile(filePath, (err, data) => {
    if (err) throw err;

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const result = {
      method: "fs.readFile (Buffer)",
      fileSize: formatBytes(data.length),
      executionTimeMs: endTime - startTime,
      memoryUsed: formatBytes(endMemory - startMemory),
    };

    console.log(result);
    callback(result);
  });
}

// Stream-based read
function readFileUsingStream(filePath, callback) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  let totalBytes = 0;
  const stream = fs.createReadStream(filePath);

  stream.on("data", (chunk) => totalBytes += chunk.length);

  stream.on("end", () => {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const result = {
      method: "fs.createReadStream (Stream)",
      fileSize: formatBytes(totalBytes),
      executionTimeMs: endTime - startTime,
      memoryUsed: formatBytes(endMemory - startMemory),
    };

    console.log(result);
    callback(result);
  });

  stream.on("error", (err) => console.error(err));
}

const filePath = "./testfile.txt";
const results = [];

readFileUsingBuffer(filePath, (bufferResult) => {
  results.push(bufferResult);
  setTimeout(() => {
    readFileUsingStream(filePath, (streamResult) => {
      results.push(streamResult);
      fs.writeFileSync("logs/day1-perf.json", JSON.stringify(results, null, 2));
      console.log("Results saved to logs/day1-perf.json");
    });
  }, 3000);
});
```
![alt text](<Screenshot from 2025-11-04 11-59-57.png>)


> ⚠️ For larger tests, the file size was increased to **500MB** using lorem-ipsum content, and `rss` memory usage was used instead of `heap`.

![alt text](<Screenshot from 2025-11-05 19-48-25.png>)

---
