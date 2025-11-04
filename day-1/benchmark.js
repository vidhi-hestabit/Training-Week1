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

    console.log("\nReading with fs.readFile (Buffer) :");
    console.log(result);
    callback(result);
  });
}

function readFileUsingStream(filePath, callback) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  let totalBytes = 0;
  const stream = fs.createReadStream(filePath);

  stream.on("data", (chunk) => {
    totalBytes += chunk.length;
  });

  stream.on("end", () => {
    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const result = {
      method: "fs.createReadStream (Stream)",
      fileSize: formatBytes(totalBytes),
      executionTimeMs: endTime - startTime,
      memoryUsed: formatBytes(endMemory - startMemory),
    };

    console.log("\n Reading with fs.createReadStream (Stream) :");
    console.log(result);
    callback(result);
  });

  stream.on("error", (err) => console.error(err));
}

const filePath = "./testfile.txt";
const results = [];

readFileUsingBuffer(filePath, (bufferResult) => {
  results.push(bufferResult);

  // Delay to let memory settle
  setTimeout(() => {
    readFileUsingStream(filePath, (streamResult) => {
      results.push(streamResult);

      // Write both results to logs/day1-perf.json
      fs.writeFileSync("logs/day1-perf.json", JSON.stringify(results, null, 2));
      console.log("\n Results saved to logs/day1-perf.json");
    });
  }, 3000);
});

