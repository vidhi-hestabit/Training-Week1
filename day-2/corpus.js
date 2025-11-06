const fs = require('fs');
const loremIpsum = require('lorem-ipsum').loremIpsum;

const generateCorpus = () => {
  const numWords = 200000; // Target word count
  let corpus = '';
  let wordsGenerated = 0;

  while (wordsGenerated < numWords) {
    corpus += loremIpsum({
      count: 1000, // number of words per iteration
      format: 'plain',
      units: 'words',
    }) + ' ';
    wordsGenerated += 1000;
  }

  // Write to a file
  fs.writeFileSync('corpus.txt', corpus);
  console.log('Corpus generated with', wordsGenerated, 'words');
};

generateCorpus();
