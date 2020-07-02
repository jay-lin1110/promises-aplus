const { promisify } = require('util');
const { readFile } = require('fs');
const { resolve } = require('path');

// use nodejs util promisify
const readFile4Promisify = promisify(readFile);

readFile4Promisify(resolve(__dirname, 'co.js'), 'utf8')
  .then(console.log)
  .catch(console.log);

// user custom util promisify
const utilPromisify = callback => (...args) =>
  new Promise((resolve, reject) =>
    callback.call(null, ...args, (error, data) =>
      !!error ? reject(error) : resolve(data)
    )
  );

const readFileAsync = utilPromisify(readFile);

readFileAsync(resolve(__dirname, 'co.js'), 'utf8')
  .then(console.log)
  .catch(console.log);
