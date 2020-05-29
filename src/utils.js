const typeSet = new Set(['Function', 'Object']);
const typeMap = new Map();
const isType = type => value =>
  Object.prototype.toString.call(value) === `[object ${type}]`;

typeSet.forEach(type => typeMap.set(`is${type}`, isType(type)));

exports.isFunction = typeMap.get('isFunction');
exports.isObject = typeMap.get('isObject');
exports.after = (times, callback) => (...args) => {
  --times === 0 && callback(args);
};
