import { Async } from "../src"
import { Fixtures } from "./fixtures"

describe("async", () => {
  it("usage example", async () => {
    let passwordPromise = Promise.resolve("kgfnasrf9q0aprifzkgl")
    let usernamePromise = Promise.resolve("frank")

    let login = (username: string, password: string) => Promise.resolve(`Logged in as ${username}!`)

    let result = await Async.of({
      username: usernamePromise,
      password: passwordPromise
    }).then((data) => {
      return login(data.username, data.password)
    }).yield()

    expect(result).toEqual("Logged in as frank!")
  })

  it("handles an object with async properties", async () => {
    let obj = Fixtures.givenAnAsyncObject()
    let syncObj = Fixtures.givenAnObject()

    // givenAnObj is just a flat object, givenAnAsync object is the same data, but with each propery being inside a Promise.

    let result = await Async.of(obj).yield()

    expect(result).toEqual(syncObj)
  })
  it("should handle objects with no async stuff in them", async () => {
    let obj = {
      cats: 200,
      dogQuote: "woof",
      catHappy: true,
      cheeses: ["Brie"],
      dogStatistics: {
        barks: 8
      },
      catDetails: [
        { name: "flurrer" }, { name: "faorma" }
      ]
    }
    let result = await Async.of(obj).yield()

    expect(result).toEqual(obj)
  })

  it("should handle an crazy long amount of then's", async () => {
    let initialPromise = Promise.resolve("Hello there!")
    let finalThenResult = "Goodbye, finally!"

    let result = await Async.of({
      data: initialPromise
    }).then((data) => {
      return { data: data.data + " I like apples!" }
    }).then((data) => {
      return {
        data: data.data + " My name is Frank Appleman. "
      }
    }).then((data) => {
      return {
        data: data.data + " I ain't no snitch!"
      }
    }).then((data) => {
      return {
        data: data,
        beetCount: 200,
        appleCount: 40923
      }
    }).then((data) => {
      return finalThenResult
    }).yield()

    expect(result).toBe(finalThenResult)
  })

  it("should handle a promise rejection by rejecting the entire yield", async () => {
    let error = "This is a problem!"
    let errorPromise: Promise<string> = Promise.reject(error)

    expect.assertions(1)

    try {
      let result = await Async.of({
        data: errorPromise
      }).then((data) => {
        return data.data + " is a cool string "
      }).then((data) => {
        return data + " is a cool string "
      }).then((data) => {
        return data + " is a cool string "
      }).yield()
    } catch (e) {
      expect(e).toEqual(error)
    }
  })

  it("should raise a promise rejection even if others succeed", async () => {
    let error = "This is a problem!"
    let errorPromise: Promise<string> = Promise.reject(error)
    let yayPromise = Promise.resolve("yay")

    expect.assertions(1)

    try {
      let result = await Async.of({
        chicken: errorPromise,
        pork: yayPromise
      }).then((data) => {
        return data.chicken + " is a cool string "
      }).then((data) => {
        return data + " is a cool string "
      }).then((data) => {
        return data + " is a cool string "
      }).yield()
    } catch (e) {
      expect(e).toEqual(error)
    }
  })
  it("should raise a promise rejection from a then clause", async () => {
    let error = "This is a problem!"
    let errorPromise: Promise<string> = Promise.reject(error)
    let yayPromise = Promise.resolve("yay")

    expect.assertions(1)

    try {
      let result = await Async.of({
        pork: yayPromise
      }).then((data) => {
        return errorPromise
      }).then((data) => {
        return data + " is a cool string "
      }).then((data) => {
        return data + " is a cool string "
      }).yield()
    } catch (e) {
      expect(e).toEqual(error)
    }
  })
})