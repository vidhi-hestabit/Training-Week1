#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const yargs = require('yargs');

// -------------------------
// WORKER THREAD CODE
// -------------------------
if (!isMainThread) {
  const { chunk, minLen } = workerData;

  const cleanWord = (word) =>
    word.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');

  const wordCounts = Object.create(null);
  for (const rawWord of chunk) {
    const word = cleanWord(rawWord);
    if (word.length >= minLen) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }

  parentPort.postMessage({ wordCounts });
  return; // Important: prevent yargs/main code from running
}

// -------------------------
// MAIN THREAD CODE
// -------------------------
const argv = yargs
  .option('file', {
    alias: 'f',
    description: 'Path to the text file',
    type: 'string',
    demandOption: true,
  })
  .option('top', {
    alias: 't',
    description: 'Top N most repeated words',
    type: 'number',
    default: 10,
  })
  .option('minLen', {
    alias: 'l',
    description: 'Minimum length of words to consider',
    type: 'number',
    default: 1,
  })
  .option('unique', {
    alias: 'u',
    description: 'Only count unique words (ignored for now)',
    type: 'boolean',
    default: false,
  })
  .help(false)
  .version(false)
  .argv;

// -------------------------
// Helper functions
// -------------------------
function splitIntoChunks(array, parts) {
  const size = Math.ceil(array.length / parts);
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function runWorker(chunk, minLen) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { chunk, minLen } });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
}

async function processWithConcurrency(words, minLen, concurrency) {
  const chunks = splitIntoChunks(words, concurrency);
  const start = process.hrtime.bigint();

  const results = await Promise.all(chunks.map(chunk => runWorker(chunk, minLen)));

  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000;

  // Merge results
  const merged = new Map();
  for (const result of results) {
    for (const [word, count] of Object.entries(result.wordCounts)) {
      merged.set(word, (merged.get(word) || 0) + count);
    }
  }

  return { merged, durationMs };
}

function computeStats(wordMap, topN) {
  const totalWords = Array.from(wordMap.values()).reduce((a, b) => a + b, 0);
  const uniqueWords = wordMap.size;
  const allWords = Array.from(wordMap.keys());
  const longestWord = allWords.reduce((a, b) => (b.length > a.length ? b : a), "");
  const shortestWord = allWords.reduce((a, b) => (b.length < a.length ? b : a), longestWord);

  const topWords = Array.from(wordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));

  return { totalWords, uniqueWords, longestWord, shortestWord, topWords };
}

// -------------------------
// MAIN EXECUTION
// -------------------------
(async () => {
  try {
    const filePath = argv.file;
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const text = fs.readFileSync(filePath, 'utf-8');
    const words = text.split(/\s+/).filter(Boolean);

    console.log(`📘 Loaded ${words.length} words from ${filePath}\n`);

    const concurrencyLevels = [1, 4, 8];
    const perfSummary = [];
    let finalStats = null;

    for (const concurrency of concurrencyLevels) {
      console.log(`⚙️ Running with concurrency level: ${concurrency}`);

      const { merged, durationMs } = await processWithConcurrency(words, argv.minLen, concurrency);
      finalStats = computeStats(merged, argv.top);

      perfSummary.push({ concurrency, durationMs });
      console.log(`✅ Completed in ${durationMs.toFixed(2)} ms\n`);
    }

    fs.mkdirSync(path.join(__dirname, 'output'), { recursive: true });
    fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });

    fs.writeFileSync(path.join(__dirname, 'output', 'stats.json'), JSON.stringify(finalStats, null, 2));
    fs.writeFileSync(path.join(__dirname, 'logs', 'perf-summary.json'), JSON.stringify(perfSummary, null, 2));

    console.log('======================');
    console.log('📊 Final Statistics');
    console.log('======================');
    console.log(`Total words:   ${finalStats.totalWords}`);
    console.log(`Unique words:  ${finalStats.uniqueWords}`);
    console.log(`Longest word:  ${finalStats.longestWord}`);
    console.log(`Shortest word: ${finalStats.shortestWord}`);
    console.log('\nTop words:');
    finalStats.topWords.forEach((w, i) => console.log(`${i + 1}. ${w.word} (${w.count})`));
    console.log('\nPerformance summary saved to logs/perf-summary.json');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
