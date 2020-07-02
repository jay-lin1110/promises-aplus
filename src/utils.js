const typeSet = new Set(['Function', 'Object']);
const typeMap = new Map();

const isType = type => value =>
  `[object ${type}]` === Object.prototype.toString.call(value);

typeSet.forEach(type => typeMap.set(`is${type}`, isType(type)));

const isFunction = typeMap.get('isFunction');

const isObject = typeMap.get('isObject');

const isPlainObject = value => !!value && 'object' === typeof value;

const after = (times, callback) => (...args) => {
  !--times && callback(...args);
};

const proxyFactory = (times, callback) =>
  new Proxy(callback, {
    apply(target, context, args) {
      !Reflect.has(target, 'times') && Reflect.set(target, 'times', times);

      times = Reflect.get(target, 'times');
      Reflect.set(target, 'times', --times);

      !times && Reflect.apply(target, context, args);
    },
  });

module.exports = {
  isFunction,
  isObject,
  isPlainObject,
  after,
  proxyFactory,
};
