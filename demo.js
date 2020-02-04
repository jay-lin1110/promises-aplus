const PromiseA = require('./src/promise')

const test = (value) => new PromiseA((resolve, reject) => {
  setTimeout(() => {
    resolve(value)
  }, 1000)
})

test(1).then(value => {
  console.log(value)
  return test(2)
}).then(value => {
  console.log(value)
})
console.log(3)

const test1 = (value) => {
  const defer = PromiseA.deferred()
  setTimeout(() => {
    defer.resolve(value)
  }, 1000)
  return defer.promise
}

test1(4).then(value => {
  console.log(value)
  return test1(5)
}).then(value => {
  console.log(value)
})
console.log(6)
