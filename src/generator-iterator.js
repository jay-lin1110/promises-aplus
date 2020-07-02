/* 迭代器对象
1. 有一个 next() 方法
2. next() 方法返回一个对象 { value: Any, done: Boolean}

const iterator = {
  next: ()=> ({
    value: 'anyType',
    done: 'boolean'
  })
}
*/

// 实现迭代器接口
const arrayLike = {
  0: 'leo',
  1: 'daisy',
  2: 'jay',
  length: 3,
  [Symbol.iterator](index = 0) {
    return {
      next: () => ({
        value: this[index],
        done: index++ === this.length,
      }),
    };
  },
};
// 展开运算符可以作用于实现了迭代器接口的类数组对象
console.log(...arrayLike);

// 生成器函数实现迭代器接口
const arrayLike4Generator = {
  0: 'leo',
  1: 'daisy',
  2: 'jay',
  length: 3,
  *[Symbol.iterator](index = 0) {
    while (index < this.length) {
      yield this[index++];
    }
  },
};

console.log(...arrayLike4Generator);

const gen = function* () {
  const a = yield 'a';
  console.log(a);

  const b = yield 'b';
  return b;
};

const it = gen();

/* console.log(it.next());
console.log(it.next());
console.log(it.next()); */

/* const co = function (it) {
  return new Promise((resolve, reject) => {
    function next(data) {
      const { value, done } = it.next(data);

      if (!done) {
        return Promise.resolve(value).then(
          result => next(result),
          reason => {
            it.throw(reason); // 可以被 try...catch 捕获异常
            reject();
          }
        );
      }
      resolve(value);
    }

    next();
  });
}; */

const co = it =>
  new Promise((resolve, reject) => {
    const next = data => {
      const { value, done } = it.next(data);

      return done
        ? resolve(value)
        : Promise.resolve(value).then(next, reason => {
            it.throw(reason); // 可以被 try...catch 捕获异常
            reject();
          });
    };

    next();
  });

co(gen()).then(console.log).catch(console.log);
