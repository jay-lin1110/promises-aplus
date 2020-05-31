const Promise = require('./src');

// const test = (value) => new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve(value)
//   }, 1000)
// })

// test(1).then(value => {
//   console.log(value)
//   return test(2)
// }).then(value => {
//   console.log(value)
// })
// console.log(3)

// const test1 = (value) => {
//   const defer = Promise.deferred()
//   setTimeout(() => {
//     defer.resolve(value)
//   }, 1000)
//   return defer.promise
// }

// test1(4).then(value => {
//   console.log(value)
//   return test1(5)
// }).then(value => {
//   console.log(value)
// })
// console.log(6)

// executor() 中抛异常
// new Promise(() => {
//   throw 'exception in executor'
// })
// .then(value => {console.log(value)})
// .catch(reason => {console.log(reason)})

// then() 中抛异常
// Promise.resolve()
// .then(() => {
//   throw 'exception in then'
// })
// .then(value => {console.log(value)})
// .catch(reason => {console.log(reason)})

// 为了确保 promise2 存在使用 setTimeout() 开启异步任务，onFulfilled() 和 onRejected() 不能在当前 then() 中上下文调用

// x 为当前 Promise 的结果，promise2 为 then() 中返回的 Promise 实例
// x === promise2
// const promise2 = Promise.resolve().then(() => promise2)
// promise2
// .then(value => {console.log(value)})
// .catch(reason => {console.log(reason)})

// 如果 x 是一个 thenable，让 x = x.then，过程可能出现异常

// const promise2 = Promise.resolve().then(() => {
//   const x = {
//     then() {
//       throw 'exception in x'
//     }
//   }
// //   const x = {}
// //   Object.defineProperty(x, 'then', {
// //   get(){
// //     throw 'exception in x'
// //   }
// // })
//   return x
// })
// promise2
// .then(value => {console.log(value)})
// .catch(reason => {console.log(reason)})

// 如果 x.then 是一个 function，让 then.call(x, res, rej) 执行
// 为什么不是 x.then(res, rej)
// const promise2 = Promise.resolve().then(() => {
//   const x = {}
//   let i = 0
//   Object.defineProperty(x, 'then', {
//     get(){
//       i++
//       if(i === 2){
//         throw 'exception in x'
//       }
//     }
//   })
//   return x
// })
// promise2
// .then(value => {console.log(value)})
// .catch(reason => {console.log(reason)})

// 返回一个嵌套的 Promise
// Promise.resolve().then(() => {
//   return Promise.resolve(Promise.resolve(Promise.resolve(1)))
// })
// .then(value => {console.log(value)})
// .catch(reason => {console.log(reason)})

// 中断 promise chain：返回一个 pending 状态的 promise
// Promise.resolve(0)
//   .then(v => void console.log(v))
//   .then(() => new Promise(() => {}))
//   .then(v => console.log(v));

// new this.constructor(() => {})
// Reflect.construct(this, () => {})
