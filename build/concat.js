'use strict';

var path = require('path');
var readline = require('readline');
var fs = require('fs');
var shell = require('shelljs');

// Default destination path for resultant json file.
var destPath = path.join('src/assets/data.json');

// Default no console logging.
var verbose = false;

// Nice ticks for logging aren't supported via windows cmd.exe
var ticksymbol = process.platform === 'win32' ? '√' : '✔';

var jsonFilePaths = [];
var concatenatedJson = {};

// Create a readline interface ( https://nodejs.org/api/readline.html )
// to read each path piped via the glob pattern in npm-script.
var rl = readline.createInterface({
  input: process.stdin,
  output: null,
  terminal: false
});

// Handle the optional `-o` argument for the destination filepath.
if (process.argv.indexOf('-o') !== -1) {
  destPath = path.join(__dirname, process.argv[process.argv.indexOf('-o') + 1]);
}

// Handle the optional `-v` argument for verbose logging.
if (process.argv.indexOf('-v') !== -1) {
  verbose = true;
}

/**
 * Get the json filename for use as json key.
 * @param {String} filepath - The filepath to the source json file.
 * @returns {String} The json filename without file extension (.json).
 */
function getKeyFromFileName(filePath) {
  return path.basename(filePath, '.json');
}

/**
 * Obtain the contents of the source .json file.
 * @param {String} filepath - The filepath to the source json file.
 * @returns {String} The json content.
 */
function readJsonFile(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

/**
 * Create a new json/object using filename as key for files content.
 * @param {String} filepath - The filepath to the source json file.
 */
function concatJson(filePath) {
  var key = getKeyFromFileName(filePath),
    json = readJsonFile(filePath);

  concatenatedJson[key] = JSON.parse(json);
}

/**
 * Save the resultant concatenated json file.
 * @param {String} filepath - The filepath to save the resultant json file.
 * @param {String} content - The json content to save to file.
 */
function saveFile(filePath, content) {
  fs.writeFile(filePath, content, function(err) {
    if (err) {
      return console.log(err);
    }

    if (verbose) {
      console.log(ticksymbol + ' Successfully created: ' + destPath);
    }
  });
}

// Read each line from process.stdin
// I.e. Each json filepath found via the glob pattern in npm-script
rl.on('line', function(filePath) {
  jsonFilePaths.push(filePath);
});

// When readline closes begin processing json files and write
// the resultant concatenated json data to disk.
rl.on('close', function() {
  jsonFilePaths.forEach(function (filePath) {
    concatJson(filePath);
  });

  saveFile(destPath, JSON.stringify(concatenatedJson, null, 2));

  shell.rm('-rf', 'tmp');
});