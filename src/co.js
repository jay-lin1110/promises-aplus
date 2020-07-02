// co lib from TJ

const { readFile } = require('fs').promises;
const { resolve } = require('path');

const readFileAsync = function* () {
  const value1 = yield readFile(resolve(__dirname, 'abort.js'), 'utf8');
  const value2 = yield readFile(resolve(__dirname, 'defer.js'), 'utf8');
  return { value1, value2 };
};

const co1 = generator => {
  const iterator = generator();
  return new Promise((resolve, reject) => {
    const next = data => {
      const { value, done } = iterator.next(data);

      return done
        ? resolve(value)
        : Promise.resolve(value).then(next, reason => {
            iterator.throw(reason); // 可以被 try...catch 捕获异常
            reject();
          });
    };

    next();
  });
};

// co1(readFileAsync).then(console.log).catch(console.log);

const co = gen =>
  new Promise((resolve, reject) => {
    const it = gen();

    (function next(data) {
      const { value, done } = it.next(data);

      return done ? resolve(value) : Promise.resolve(value).then(next, reject);
    })();
  });

co(readFileAsync).then(console.log).catch(console.log);

const coAsync = async () => {
  try {
    await co(readFileAsync);
  } catch (error) {
    console.log(error);
  }
};

coAsync();
