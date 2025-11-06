const fs = require('fs');
const { loremIpsum } = require('lorem-ipsum');

const targetBytes = 500 * 1024 * 1024; // 50 MB
let currentBytes = 0;

const stream = fs.createWriteStream('textfile.txt', { flags: 'w' });

while (currentBytes < targetBytes) {
  const chunk = loremIpsum({
    count: 1000, // words per chunk
    units: 'words',
    format: 'plain'
  }) + ' ';

  const chunkBytes = Buffer.byteLength(chunk, 'utf8');

  // Write only the amount needed to reach target size
  if (currentBytes + chunkBytes > targetBytes) {
    const remainingBytes = targetBytes - currentBytes;
    stream.write(chunk.slice(0, remainingBytes));
    currentBytes += remainingBytes;
  } else {
    stream.write(chunk);
    currentBytes += chunkBytes;
  }
}

stream.end();
console.log('Generated textfile.txt with approximately 50 MB');
