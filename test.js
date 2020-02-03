// npm i -g promises-aplus-tests
// promises-aplus-tests test.js
const PromiseA = require('./promise')

PromiseA.deferred = function () {
  let deferred = {}
  deferred.promise = new PromiseA((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })
  return deferred
}

module.exports = PromiseA
