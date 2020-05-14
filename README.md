# Higher Order Promises
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=LiveRamp_higher-order-promise&metric=coverage&token=0b9c07102104a80f0af5478dd78938d7fe245d2d)](https://sonarcloud.io/dashboard?id=LiveRamp_higher-order-promise)

This package allows you to fluently parallelize asynchronous calls, while retaining type information, and deferring any actual awaiting until your choosing via calling `yield()`.

In english, this means you will spend less time wrangling `Promise`s, and your code will perform better than if you were to naively use `await`s.

For examples of usage, check out its [tests](test/higher-order-promise.test.ts).

## Installation

Package publishing is currently blocked as we set up a public LiveRamp org on NPM.

## In-depth justification
The usual way of handling asynchronous computation in Typescript is leveraging async/await. This is reasonably intuitive while keeping you out of callback hell.

Consider the following snippet:
```typescript
async function awaitTestSequence() {
  let result1 = await slowPromise("1", 1000, 10);
  let result2 = await slowPromise("2", 1000, 20);

  return result1 + result2
}

function slowPromise<T>(identifier: string, timeout: number, result: T): Promise<T> {
  return new Promise((resolve) => {
    console.log(`Starting promise: ${identifier}`)
    setTimeout(() => {console.log(`Ending promise: ${identifier}`) resolve(result)}, timeout)
  })
}
```

Calling `awaitTestSequence` yields output like:
```
Starting promise: 1
Ending promise: 1
Starting promise: 2
Ending promise: 2
```

Yet, promise 2 doesn't need anything from promise 1, why wait at all to execute it?

Sure, you can avoid unnecessary waiting in native TS, but the best you can come up with is something like:

```typescript
async function betterAwaitTestSequence() {
  let [result1, result2] = await Promise.all([
    slowPromise("1", 1000, 10),
    slowPromise("2", 1000, 10)
  ])

  return result1 + result2
}
```

This is already a little cumbersome even in the simplest case. You lose the ease of having a simple reference to the promise, unless you
manually wrangle indices or use a destructuring approach. If you add a promise, you'll need to update to destructure that instance. Readability is hurt, as you have to mentally associate which promise is which index. In short, order matters here, but it shouldn't.

Further, Promise.all has a limitation on supporting only 10 promises before type information is lost.

Finally, let's imagine you wanted to use result1 or result2 to trigger further asynchronous work. This requires even more wrangling.

Instead, `HigherOrderPromise` provides a different abstraction. It lets you build objects which contain asynchronous properties, then compose operations on top of them.

Here's an example of the above using Await
```typescript
HigherOrderPromise.from({
  result1: slowPromise("1", 1000, 10),
  result2: slowPromise("2", 1000, 10)
}).then((data) => {
  return data.result1 + data.result2
}).yield()
```

