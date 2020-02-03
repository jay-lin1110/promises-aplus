// 2.1 Promise States
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
const PENDING = 'pending'
// 2.3 The Promise Resolution Procedure
const resolvePromise = (promise2, x, resolve, reject) => {
  // 2.3.1 promise2 === x => TypeError
  if (promise2 === x) {
    reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if ((typeof x === 'object' && x !== null) || typeof x === 'function') {// x是promise
    let isCalled
    try {
      let then = x.then
      if (typeof then === 'function') {// 2.3.3.3
        then.call(x, y => {// 2.3.3.3.1
          if (isCalled) return
          isCalled = true
          resolvePromise(promise2, y, resolve, reject)
        }, r => {// 2.3.3.3.2
          if (isCalled) return
          isCalled = true
          reject(r)
        })
      } else {// 2.3.3.4 then is not a function
        resolve(x)
      }
    } catch (error) {// 2.3.3.2 retrieving the property x.then results in a thrown exception e
      if (isCalled) return
      isCalled = true
      reject(error)
    }
  } else { // 2.3.4 x is not an object or function
    resolve(x)
  }
}

class PromiseA {
  constructor(executor) {
    this.state = PENDING
    this.value = undefined
    this.callbacks = []

    const resolve = value => {
      if (value instanceof PromiseA) {
        return value.then(resolve, reject)
      }

      if (this.state === PENDING) {
        this.state = FULFILLED
        this.value = value
        this.callbacks.forEach(callbackObj => callbackObj.onFulfilled(value))
      }
    }
    const reject = reason => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.value = reason
        this.callbacks.forEach(callbackObj => callbackObj.onRejected(reason))
      }
    }
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  // 2.2 The then Method
  then(onFulfilled, onRejected) {
    // 2.2.1 Both onFulfilled and onRejected are optional arguments
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : error => { throw error }
    let promise2 = new PromiseA((resolve, reject) => {
      // handle sync tasks
      if (this.state === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
      if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
      // handle async tasks
      if (this.state === PENDING) {
        this.callbacks.push({
          onFulfilled: () => {
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value)
                resolvePromise(promise2, x, resolve, reject)
              } catch (error) {
                reject(error)
              }
            })
          },
          onRejected: () => {
            setTimeout(() => {
              try {
                let x = onRejected(this.value)
                resolvePromise(promise2, x, resolve, reject)
              } catch (error) {
                reject(error)
              }
            })
          }
        })
      }
    })
    return promise2
  }
  catch(onRejected) {
    return this.then(undefined, onRejected)
  }
  static resolve(value) {
    return new PromiseA((resolve, reject) => {
      resolve(value)
    })
  }
  static reject(reason) {
    return new PromiseA((resolve, reject) => {
      reject(reason)
    })
  }
  static all(promises) {
    return new PromiseA((resolve, reject) => {
      let values = []
      let valuesLength = 0
      promises.forEach((promise, index) => {
        PromiseA.resolve(promise).then(value => {
          values[index] = value
          if (++valuesLength === promises.length) {
            resolve(values)
          }
        }, reject)
      })
    })
  }
  static race(promises) {
    return new PromiseA((resolve, reject) => {
      promises.forEach(promise => {
        PromiseA.resolve(promise).then(resolve, reject)
      })
    })
  }
  // npm i -g promises-aplus-tests
  // promises-aplus-tests promise.js
  static deferred() {
    let deferred = {}
    deferred.promise = new PromiseA((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    return deferred
  }
}

module.exports = PromiseA
