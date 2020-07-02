// spawn() 函数作为一个自动执行器，作为 Generator 函数的 runner
// generator gen
// iterator it

const { readFile } = require('fs').promises;
const { resolve } = require('path');

const readFileAsync = function* () {
  const value1 = yield readFile(resolve(__dirname, 'abort.js'), 'utf8');
  const value2 = yield readFile(resolve(__dirname, 'defer.js'), 'utf8');
  return { value1, value2 };
};

const spawn = gen =>
  new Promise((resolve, reject) => {
    const it = gen();
    (function step(next = () => it.next(undefined)) {
      let result;

      try {
        result = next();
      } catch (error) {
        return reject(error);
      }

      const { value, done } = result;

      return done
        ? resolve(value)
        : Promise.resolve(value).then(
            v => step(() => it.next(v)),
            r => step(() => it.throw(r))
          );
    })();
  });

spawn(readFileAsync).then(console.log).catch(console.log);

const readFileSpawn = async () => {
  try {
    await spawn(readFileAsync);
  } catch (error) {
    console.log(error);
  }
};

readFileSpawn();
