**Day 2: Node CLI App + Concurrency + Large Data Processing** project.

---

````{"id":"52183","variant":"standard","title":"Day 2 – Node CLI App + Concurrency + Large Data Processing"}
# 🧠 Day 2 — Node CLI App + Concurrency + Large Data Processing

## 🔹 Objective
Build a **Node.js Command Line Interface (CLI) tool** that performs **large-scale text data analysis** on a generated corpus file (200,000+ words).  
The app demonstrates **asynchronous programming**, **concurrency**, and **performance benchmarking**.

---

## 🧩 Learning Outcomes
- Understanding **Asynchronous programming** in Node.js  
- Building an **interactive CLI tool** using `yargs`  
- Implementing **Concurrency** with `Promise.all`  
- Measuring and benchmarking **runtime performance**

---

## ⚙️ Tasks Overview

### 1. Generate a Large Corpus File
Generate a text file (`corpus.txt`) containing **200,000+ random words** using the `lorem-ipsum` package.

**Steps:**
```bash
npm install lorem-ipsum
nano corpus.js
```

**corpus.js**
```js
const fs = require('fs');
const { loremIpsum } = require('lorem-ipsum');

const generateCorpus = () => {
  const numWords = 200000;
  let corpus = '';
  let wordsGenerated = 0;

  while (wordsGenerated < numWords) {
    corpus += loremIpsum({
      count: 1000,
      format: 'plain',
      units: 'words',
    }) + ' ';
    wordsGenerated += 1000;
  }

  fs.writeFileSync('corpus.txt', corpus);
  console.log('Corpus generated with', wordsGenerated, 'words');
};

generateCorpus();
```

**Run:**
```bash
node corpus.js
```
This creates a `corpus.txt` file with 200,000+ words.

---

### 2. Build CLI Command

Create a CLI script `wordstat.js` to analyze the corpus.

**Usage Example:**
```bash
node wordstat.js --file corpus.txt --top 10 --minLen 5 --unique --concurrency 4
```

**Command-line Options:**
| Option | Alias | Description | Default |
|--------|--------|-------------|----------|
| `--file` | `-f` | Path to text file | Required |
| `--top` | `-t` | Top N most frequent words | 10 |
| `--minLen` | `-l` | Minimum word length to consider | 1 |
| `--unique` | `-u` | Count only unique words | false |
| `--concurrency` | — | Number of concurrent workers | 4 |

---

### 3. CLI Output Requirements

The tool must compute and display:
- ✅ Total words  
- ✅ Unique words  
- ✅ Longest word  
- ✅ Shortest word  
- ✅ Top N most repeated words  

---

### 4. Implement Concurrency

Split the corpus into **chunks** and process each chunk **in parallel** using `Promise.all`.

Benchmark performance across different concurrency levels:
```js
const concurrencyLevels = [1, 4, 8];
```

Measure execution time for each concurrency level and store in logs.

---

### 5. Benchmarking and Logging

For each concurrency level:
- Calculate total processing time
- Save results to JSON files

**Output Structure:**
```
output/
 └── stats.json          ← Final computed statistics

logs/
 └── perf-summary.json   ← Runtime performance summary
```

---

## 📊 Sample Output

### `output/stats.json`
```json
{
  "totalWords": 200000,
  "uniqueWords": 9998,
  "longestWord": "consectetur",
  "shortestWord": "ad",
  "topWords": [
    { "word": "lorem", "count": 1523 },
    { "word": "ipsum", "count": 1498 },
    { "word": "dolor", "count": 1472 }
  ]
}
```

### `logs/perf-summary.json`
```json
[
  { "concurrency": 1, "duration": 5200 },
  { "concurrency": 4, "duration": 2300 },
  { "concurrency": 8, "duration": 1500 }
]
```

---

## 🧪 Run the App

```bash
node wordstat.js --file corpus.txt --top 10 --minLen 5 --unique --concurrency 4
```

---

## 💾 Deliverables

| Deliverable | Description |
|--------------|-------------|
| `wordstat.js` | Executable CLI tool |
| `output/stats.json` | Final computed statistics |
| `logs/perf-summary.json` | Concurrency performance report |
| Commits | Minimum 8 commits documenting progress |

---

## 🕒 Suggested Commit Flow

1. `init: setup project and install dependencies`  
2. `feat: add corpus generator script`  
3. `feat: implement CLI argument parsing with yargs`  
4. `feat: add word frequency and length analysis`  
5. `feat: implement concurrency using Promise.all`  
6. `feat: add benchmarking and performance logging`  
7. `fix: optimize memory usage and edge cases`  
8. `docs: update README and final output`

---

## ✅ Summary
This project demonstrates how to build a **scalable Node.js CLI** for processing **large datasets** with **asynchronous programming** and **concurrent execution**, complete with **performance benchmarking** and structured **JSON output**.

---
````
