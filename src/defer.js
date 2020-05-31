const Promise = require('./index');

// use Promise
const wait4Promise = delay =>
  new Promise(resolve => setTimeout(resolve, delay));

wait4Promise(2000).then(() => console.log('wait 2s to log wait4Promise'));

// use Promise.defer()
/* const wait4Defer = delay => {
  const { resolve, promise } = Promise.defer();

  setTimeout(resolve, delay);

  return promise;
}; */

const wait4Defer = (delay, { resolve, promise } = Promise.defer()) => {
  setTimeout(resolve, delay);

  return promise;
};

wait4Defer(2000).then(() => console.log('wait 2s to log wait4Defer'));

// use Promise.defer4Map()
/* const wait4DeferMap = delay => {
  const deferral = Promise.defer4Map();

  setTimeout(deferral.get('resolve'), delay);

  return deferral.get('promise');
}; */
const wait4DeferMap = (delay, deferral = Promise.defer4Map()) => {
  setTimeout(deferral.get('resolve'), delay);

  return deferral.get('promise');
};

wait4DeferMap(2000).then(() => console.log('wait 2s to log wait4DeferMap'));
