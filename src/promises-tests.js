/* use promises-aplus-tests module to test custom Promise

Step 1: npm i -g promises-aplus-tests
Step 2: promises-aplus-tests test.js */
const Promise = require('./index');

Promise.deferred = function (deferral = {}) {
  return Object.assign(deferral, {
    promise: new this((resolve, reject) =>
      Object.assign(deferral, { resolve, reject })
    ),
  });
};

module.exports = Promise;
