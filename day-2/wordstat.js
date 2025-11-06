const fs = require('fs');
const yargs = require('yargs');
const path = require('path');

// Argument parsing with yargs
const argv = yargs
  .option('file', {
    alias: 'f',
    description: 'Path to the text file',
    type: 'string',
    demandOption: true, // Ensures the file argument is required
  })
  .option('top', {
    alias: 't',
    description: 'Top N most repeated words',
    type: 'number',
    default: 10, // Defaults to top 10 most repeated words
  })
  .option('minLen', {
    alias: 'l',
    description: 'Minimum length of words to consider',
    type: 'number',
    default: 1, // Defaults to considering all words
  })
  .option('unique', {
    alias: 'u',
    description: 'Only count unique words',
    type: 'boolean',
    default: false,
  })
  .option('concurrency', {
    description: 'Number of concurrent workers to use',
    type: 'number',
    default: 4, // Default concurrency is 4
  })
  .help()
  .argv;

// Read file and process words
const processFile = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf-8');
  return data.split(/\s+/).filter((word) => word.length >= argv.minLen); // Split by spaces and filter by min length
};

// Function to calculate statistics
const getStats = (words) => {
  const totalWords = words.length;

  // Get unique words if required
  const uniqueWords = [...new Set(words)].length;

  // Calculate word frequencies
  const wordCounts = {};
  words.forEach((word) => {
    word = word.toLowerCase(); // Normalize word to lowercase
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Sort words by frequency
  const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);

  // Get the top N most frequent words
  const topWords = sortedWords.slice(0, argv.top).map(([word, count]) => ({
    word,
    count,
  }));

  // Find the longest and shortest word
  const longestWord = words.reduce((longest, word) => word.length > longest.length ? word : longest, "");
  const shortestWord = words.reduce((shortest, word) => word.length < shortest.length ? word : shortest, longestWord);

  return {
    totalWords,
    uniqueWords,
    longestWord,
    shortestWord,
    topWords,
  };
};

// Split the file into chunks based on number of words
const splitFileIntoChunks = (words, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  return chunks;
};

// Process a chunk of words and return the stats
const processChunk = (chunk) => {
  return getStats(chunk);
};

// Run the program with concurrency
const runWithConcurrency = async (words, concurrencyLevel) => {
  const chunkSize = Math.ceil(words.length / concurrencyLevel);
  const chunks = splitFileIntoChunks(words, chunkSize);

  const start = Date.now();

  // Process chunks in parallel using Promise.all
  const results = await Promise.all(chunks.map(processChunk));

  const end = Date.now();
  const duration = end - start;

  return { results, duration };
};

// Output the results to JSON file
const outputResultsToJSON = (finalStats, perfSummary) => {
  fs.writeFileSync(path.join(__dirname, 'output', 'stats.json'), JSON.stringify(finalStats, null, 2));
  fs.writeFileSync(path.join(__dirname, 'logs', 'perf-summary.json'), JSON.stringify(perfSummary, null, 2));
};

// Main function
const main = async () => {
  // Read and process the input file
  const words = processFile(argv.file); // Read the file and split words

  // Array to store performance results for benchmarking
  const perfSummary = [];
  let finalStats;

  // Run the task for each concurrency level and benchmark the performance
  const concurrencyLevels = [1, 4, 8];

  for (const concurrency of concurrencyLevels) {
    console.log(`Running with concurrency level: ${concurrency}`);

    const { results, duration } = await runWithConcurrency(words, concurrency);

    // Aggregate the results from all chunks
    const aggregatedStats = results.reduce((acc, chunkStats) => {
      acc.totalWords += chunkStats.totalWords;
      acc.uniqueWords += chunkStats.uniqueWords;
      acc.topWords = [...acc.topWords, ...chunkStats.topWords];
      return acc;
    }, { totalWords: 0, uniqueWords: 0, topWords: [] });

    // Get the top N most frequent words from all chunks
    const finalTopWords = aggregatedStats.topWords
      .reduce((acc, word) => {
        acc[word.word] = (acc[word.word] || 0) + word.count;
        return acc;
      }, {});

    finalStats = {
      totalWords: aggregatedStats.totalWords,
      uniqueWords: aggregatedStats.uniqueWords,
      longestWord: words.reduce((longest, word) =>
        word.length > longest.length ? word : longest
      ),
      shortestWord: words.reduce((shortest, word) =>
        word.length < shortest.length ? word : shortest
      ),
      topWords: Object.entries(finalTopWords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, argv.top)
        .map(([word, count]) => ({ word, count })),
    };

    perfSummary.push({
      concurrency,
      duration,
    });
  }

  // Output results and performance summary to JSON files
  outputResultsToJSON(finalStats, perfSummary);

  console.log('Processing complete. Results saved to stats.json and perf-summary.json.');
};

main().catch((err) => {
  console.error('Error during processing:', err);
});

