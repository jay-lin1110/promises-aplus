const { isFunction, isObject, after } = require('./utils');

class PromisesA {
  static #PENDING = Symbol.for('pending');
  static #FULFILLED = Symbol.for('fulfilled');
  static #REJECTED = Symbol.for('rejected');

  static #Resolve = (promise2, x, resolve, reject) => {
    /*     if (promise2 === x) {
      return reject(
        new TypeError('Chaining cycle detected for promise #<Promise>')
      );
    } */
    if (Object.is(promise2, x)) {
      return reject(
        new TypeError('Chaining cycle detected for promise #<Promise>')
      );
    }

    // optional step
    /*     if (x instanceof this) {
      return x.then(y => this.#Resolve(promise2, y, resolve, reject), reject);
    } */

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
                return this.#Resolve(promise2, y, resolve, reject);
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

  #status = this.constructor.#PENDING;
  #value;
  #callbackSet = new Set();

  constructor(executor) {
    const resolve = value => {
      // 配合类方法成员 this.constructor.resolve() 的实现
      if (value instanceof new.target) {
        return value.then(resolve, reject);
      }

      if (this.#status !== new.target.#PENDING) return;

      this.#status = new.target.#FULFILLED;
      this.#value = value;
      !!this.#callbackSet.size &&
        this.#callbackSet.forEach(
          callbackMap =>
            callbackMap.has('onFulfilled') && callbackMap.get('onFulfilled')()
        );
    };

    const reject = reason => {
      if (this.#status !== new.target.#PENDING) return;

      this.#status = new.target.#REJECTED;
      this.#value = reason;
      !!this.#callbackSet.size &&
        this.#callbackSet.forEach(
          callbackMap =>
            callbackMap.has('onRejected') && callbackMap.get('onRejected')()
        );
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
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

      const callbackHandler = onResolved => () =>
        setTimeout(() => {
          try {
            const x = onResolved(this.#value);

            this.constructor.#Resolve(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });

      const statusMap = new Map()
        .set(this.constructor.#PENDING, () =>
          this.#callbackSet.add(
            new Map([
              ['onFulfilled', callbackHandler(onFulfilled)],
              ['onRejected', callbackHandler(onRejected)],
            ])
          )
        )
        .set(this.constructor.#FULFILLED, callbackHandler(onFulfilled))
        .set(this.constructor.#REJECTED, callbackHandler(onRejected));

      statusMap.has(this.#status) && statusMap.get(this.#status)();
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
      const { length } = iterator;
      const values = new Array(length);
      let valuesLength = 0;

      iterator.forEach((item, index) => {
        this.resolve(item).then(value => {
          values[index] = value;

          ++valuesLength === length && resolve(values);
        }, reject);
      });
    });

  static race = iterator =>
    new this((resolve, reject) =>
      iterator.forEach(item => this.resolve(item).then(resolve, reject))
    );

  static allSettled = iterator =>
    new this(resolve => {
      const { length } = iterator;
      const values = new Array(length);
      let valuesLength = 0;

      iterator.forEach((item, index) =>
        this.resolve(item).then(
          value => {
            values[index] = {
              status: Symbol.keyFor(this.#FULFILLED),
              value,
            };
            ++valuesLength === length && resolve(values);
          },
          reason => {
            values[index] = {
              status: Symbol.keyFor(this.#REJECTED),
              reason,
            };
            ++valuesLength === length && resolve(values);
          }
        )
      );
    });

  static all4After = iterator =>
    new this((resolve, reject) => {
      const { length } = iterator;
      const resolveValues = after(length, resolve);
      const values = new Array(length);

      iterator.forEach((item, index) => {
        this.resolve(item).then(value => {
          values[index] = value;
          resolveValues(values);
        }, reject);
      });
    });

  static allSettled4After = iterator =>
    new this(resolve => {
      const { length } = iterator;
      const resolveValues = after(length, resolve);
      const values = new Array(length);

      iterator.forEach((item, index) =>
        this.resolve(item).then(
          value => {
            values[index] = {
              status: Symbol.keyFor(this.#FULFILLED),
              value,
            };
            resolveValues(values);
          },
          reason => {
            values[index] = {
              status: Symbol.keyFor(this.#REJECTED),
              reason,
            };
            resolveValues(values);
          }
        )
      );
    });

  static try = callback =>
    new this((resolve, reject) =>
      this.resolve(callback()).then(resolve, reject)
    );

  /* static defer = () => {
    const deferral = {
      promise: null,
      resolve: null,
      reject: null,
    };

    deferral.promise = new this((resolve, reject) => {
      deferral.resolve = resolve;
      deferral.reject = reject;
    });

    return deferral;
  }; */

  static defer = (deferral = {}) =>
    Object.assign(deferral, {
      promise: new this((resolve, reject) =>
        Object.assign(deferral, { resolve, reject })
      ),
    });

  static get deferred() {
    return this.defer;
  }

  /*   static defer4Map = () => {
    const deferral = new Map();

    const promise = Reflect.construct(this, [
      (resolve, reject) =>
        deferral.set('resolve', resolve).set('reject', reject),
    ]);

    return deferral.set('promise', promise);
  }; */
  static defer4Map = (deferral = new Map()) =>
    deferral.set(
      'promise',
      Reflect.construct(this, [
        (resolve, reject) =>
          deferral.set('resolve', resolve).set('reject', reject),
      ])
    );
}

module.exports = PromisesA;
