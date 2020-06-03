const { readFile } = require('fs')['promises'];
const { resolve } = require('path');

const readFileAsync = function* () {
  const value1 = yield readFile(resolve(__dirname, 'abort.js'), 'utf8');
  const value2 = yield readFile(resolve(__dirname, 'defer.js'), 'utf8');
  return { value1, value2 };
};

const co = it =>
  new Promise((resolve, reject) => {
    const next = data => {
      const { value, done } = it.next(data);

      if (!done) {
        Promise.resolve(value).then(
          data => next(data),
          error => reject(error)
        );
      } else {
        resolve(value);
      }
    };

    next();
  });

co(readFileAsync()).then(console.log);
