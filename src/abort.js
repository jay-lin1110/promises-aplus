const Promise = require('./index');
const cancel = (promise, abort) => {
  const controller = new Promise((resolve, reject) => {
    abort = reject;
  });
  const AbortController = Promise.race([controller, promise]);

  AbortController.abort = abort;

  return AbortController;
};

const promise1 = new Promise(resolve => setTimeout(resolve, 1000));
const promise2 = cancel(promise1);

promise2.abort('cancel');
promise2.then(console.log).catch(console.log);
