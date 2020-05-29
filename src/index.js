const { isFunction, isObject, after } = require('./utils');

class PromisesA {
  static #FULFILLED;
  static #REJECTED;
  static #PENDING;
  static #Resolve = (promise2, x, resolve, reject) => {
    /*         promise2 === x &&
      reject(new TypeError('Chaining cycle detected for promise #<Promise>')); */

    Object.is(promise2, x) &&
      reject(new TypeError('Chaining cycle detected for promise #<Promise>'));

    // optional step
    // x instanceof this && x.then(this.#Resolve, reject);

    if (isObject(x) || isFunction(x)) {
      let called = false;

      try {
        const { then } = x;

        isFunction(then)
          ? then.call(
              x,
              y => {
                if (called) return;

                called = true;
                this.#Resolve(promise2, y, resolve, reject);
              },
              r => {
                if (called) return;

                called = true;
                reject(r);
              }
            )
          : resolve(x);
      } catch (error) {
        if (called) return;

        called = true;
        reject(error);
      }
    } else {
      resolve(x);
    }
  };

  #status;
  #value;
  #reason;
  #callbackSet = new Set();
  #resolve = value => {
    if (value instanceof this.constructor) {
      return value.then(this.#resolve, this.#reject);
    }

    if (this.#status !== this.constructor['#PENDING']) return;

    this.#status = this.constructor['#FULFILLED'];
    this.#value = value;
    this.#callbackSet.forEach(
      callbackMap =>
        isFunction(callbackMap.get('onFulfilled')) &&
        callbackMap.get('onFulfilled')()
    );
  };
  #reject = reason => {
    if (this.#status !== this.constructor['#PENDING']) return;

    this.#status = this.constructor['#REJECTED'];
    this.#reason = reason;
    this.#callbackSet.forEach(
      callbackMap =>
        isFunction(callbackMap.get('onRejected')) &&
        callbackMap.get('onRejected')()
    );
  };

  constructor(executor) {
    new.target['#FULFILLED'] = Symbol.for('fulfilled');
    new.target['#REJECTED'] = Symbol.for('rejected');
    this.#status = new.target['#PENDING'] = Symbol.for('pending');

    try {
      executor(this.#resolve, this.#reject);
    } catch (error) {
      this.#reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    const promise2 = new this.constructor((resolve, reject) => {
      onFulfilled = isFunction(onFulfilled) ? onFulfilled : value => value;
      onRejected = isFunction(onRejected)
        ? onRejected
        : reason => {
            throw reason;
          };

      const statusMap = new Map()
        .set(this.constructor['#FULFILLED'], () =>
          setTimeout(() => {
            try {
              const x = onFulfilled(this.#value);

              this.constructor.#Resolve(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          })
        )
        .set(this.constructor['#REJECTED'], () =>
          setTimeout(() => {
            try {
              const x = onRejected(this.#reason);

              this.constructor.#Resolve(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          })
        )
        .set(this.constructor['#PENDING'], () =>
          this.#callbackSet.add(
            new Map()
              .set('onFulfilled', () =>
                setTimeout(() => {
                  try {
                    const x = onFulfilled(this.#value);

                    this.constructor.#Resolve(promise2, x, resolve, reject);
                  } catch (error) {
                    reject(error);
                  }
                })
              )
              .set('onRejected', () =>
                setTimeout(() => {
                  try {
                    const x = onRejected(this.#reason);

                    this.constructor.#Resolve(promise2, x, resolve, reject);
                  } catch (error) {
                    reject(error);
                  }
                })
              )
          )
        );

      isFunction(statusMap.get(this.#status)) && statusMap.get(this.#status)();
    });

    return promise2;
  }

  catch = onRejected => this.then(null, onRejected);

  finally = onFinally =>
    this.then(
      value => this.constructor.resolve(onFinally()).then(() => value),
      reason =>
        this.constructor.resolve(onFinally()).then(() => {
          throw reason;
        })
    );

  static resolve = value => new this(resolve => resolve(value));

  static reject = reason => new this((undefined, reject) => reject(reason));

  static all = iterator =>
    new this((resolve, reject) => {
      const values = [];
      let valuesLength = 0;

      iterator.forEach((item, index) => {
        this.resolve(item).then(value => {
          values[index] = value;
          ++valuesLength === iterator['length'] && resolve(values);
        }, reject);
      });
    });

  static race = iterator =>
    new this((resolve, reject) =>
      iterator.forEach(item => this.resolve(item).then(resolve, reject))
    );

  static allSettled = iterator =>
    new this(resolve => {
      const values = [];
      let valuesLength = 0;

      iterator.forEach((item, index) =>
        this.resolve(item).then(
          value => {
            values[index] = {
              status: Symbol.keyFor(this['#FULFILLED']),
              value,
            };
            ++valuesLength === iterator['length'] && resolve(values);
          },
          reason => {
            values[index] = {
              status: Symbol.keyFor(this['#REJECTED']),
              reason,
            };
            ++valuesLength === iterator['length'] && resolve(values);
          }
        )
      );
    });

  static all4After = iterator =>
    new this((resolve, reject) => {
      const resolveValues = after(iterator['length'], resolve);
      const values = [];

      iterator.forEach((item, index) => {
        this.resolve(item).then(value => {
          values[index] = value;
          resolveValues(values);
        }, reject);
      });
    });

  static allSettled4After = iterator =>
    new this(resolve => {
      const resolveValues = after(iterator['length'], resolve);
      const values = [];

      iterator.forEach((item, index) =>
        this.resolve(item).then(
          value => {
            values[index] = {
              status: Symbol.keyFor(this['#FULFILLED']),
              value,
            };
            resolveValues(values);
          },
          reason => {
            values[index] = {
              status: Symbol.keyFor(this['#REJECTED']),
              reason,
            };
            resolveValues(values);
          }
        )
      );
    });

  static defer = () => {
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

  static get deferred() {
    return this.defer;
  }

  static defer4Map = () => {
    const deferral = new Map();

    const promise = new this((resolve, reject) => {
      deferral.set('resolve', resolve);
      deferral.set('reject', reject);
    });

    return deferral.set('promise', promise);
  };
}

module.exports = PromisesA;

// Promise.all([1, Promise.resolve(3), 2]).then(console.log);
