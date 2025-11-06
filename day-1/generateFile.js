const fs = require("fs");
const filePath = "./testfile.txt";
const fileSizeMB = 50; // Desired size in MB
const chunkSize = 1024 * 1024; // 1 MB chunks
const buffer = Buffer.alloc(chunkSize, "A"); // Fill with letter "A"

const stream = fs.createWriteStream(filePath);

let written = 0;

function writeChunk() {
  if (written >= fileSizeMB) {
    stream.end();
    console.log(`File created: ${filePath} (${fileSizeMB} MB)`);
    return;
  }
  stream.write(buffer, () => {
    written++;
    writeChunk();
  });
}

writeChunk();
