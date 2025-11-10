#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { performance } = require('perf_hooks');

// -------------------------
// WORKER THREAD CODE
// -------------------------
if (!isMainThread) {
  const { chunk, minLen } = workerData;
  const clean = (w) => w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
  const counts = {};

  for (const raw of chunk) {
    const w = clean(raw);
    if (w.length >= minLen) counts[w] = (counts[w] || 0) + 1;
  }

  parentPort.postMessage(counts);
  return;
}

// -------------------------
// ARGUMENT PARSING
// -------------------------
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return def;
};

const filePath = getArg('--file', getArg('-f'));
const topN = parseInt(getArg('--top', getArg('-t', '10')));
const minLen = parseInt(getArg('--minLen', getArg('-l', '1')));

if (!filePath) {
  console.error('Usage: node wordstat.js --file <path> [--top N] [--minLen N]');
  process.exit(1);
}

// -------------------------
// HELPERS
// -------------------------
function splitIntoChunks(arr, parts) {
  const size = Math.ceil(arr.length / parts);
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function runWorker(chunk, minLen) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: { chunk, minLen } });
    worker.on('message', (data) => resolve(data));
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with code ${code}`));
    });
  });
}

async function processWithConcurrency(words, minLen, concurrency) {
  const chunks = splitIntoChunks(words, concurrency);
  const start = performance.now();

  const results = await Promise.all(chunks.map((chunk) => runWorker(chunk, minLen)));

  const end = performance.now();
  const durationMs = end - start;

  // Merge results
  const merged = new Map();
  for (const result of results) {
    for (const [word, count] of Object.entries(result)) {
      merged.set(word, (merged.get(word) || 0) + count);
    }
  }

  return { merged, durationMs };
}

function computeStats(map, topN) {
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  const unique = map.size;
  const allWords = [...map.keys()];
  const longest = allWords.reduce((a, b) => (b.length > a.length ? b : a), '');
  const shortest = allWords.reduce((a, b) => (b.length < a.length ? b : a), longest);
  const top = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([w, c]) => ({ word: w, count: c }));
  return { total, unique, longest, shortest, top };
}

// -------------------------
// MAIN EXECUTION
// -------------------------
(async () => {
  try {
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      process.exit(1);
    }

    const text = fs.readFileSync(filePath, 'utf-8');
    const words = text.split(/\s+/).filter(Boolean);

    console.log(`Loaded ${words.length} words from ${filePath}`);

    const concurrencyLevels = [1, 4, 8];
    const perfSummary = [];
    let stats = null;

    for (const level of concurrencyLevels) {
      const { merged, durationMs } = await processWithConcurrency(words, minLen, level);
      stats = computeStats(merged, topN);
      perfSummary.push({ concurrency: level, durationMs: durationMs.toFixed(2) });
      console.log(`Concurrency ${level}: ${durationMs.toFixed(2)} ms`);
    }

    fs.mkdirSync('logs', { recursive: true });
    fs.mkdirSync('output', { recursive: true });

    fs.writeFileSync('logs/perf-summary.json', JSON.stringify(perfSummary, null, 2));
    fs.writeFileSync('output/stats.json', JSON.stringify(stats, null, 2));
} catch (err) {
    console.error('Error:', err);
  }
})();
