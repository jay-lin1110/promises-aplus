const isFunction = value => typeof value === 'function';

class PromisesA {
  static #FULFILLED;
  static #REJECTED;
  static #PENDING;

  #status;
  #value;
  #reason;
  #resolve = value => {
    if (this.#status !== this.constructor['#PENDING']) return;

    this.#status = this.constructor['#FULFILLED'];
    this.#value = value;
  };
  #reject = reason => {
    if (this.#status !== this.constructor['#PENDING']) return;

    this.#status = this.constructor['#REJECTED'];
    this.#reason = reason;
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

  then(onFulfilled, onRejected) {}
}

module.exports = PromisesA;
