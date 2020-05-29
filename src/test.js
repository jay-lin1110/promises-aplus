// use promises-aplus-tests to test
// npm i -g promises-aplus-tests
// promises-aplus-tests test.js
const Promise = require('./index');

Promise.deferred = function () {
  const deferral = {
    promise: null,
    resolve: null,
    reject: null,
  };

  deferral['promise'] = new this((resolve, reject) => {
    deferral.resolve = resolve;
    deferral.reject = reject;
  });

  return deferral;
};

module.exports = Promise;
