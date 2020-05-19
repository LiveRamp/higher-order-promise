export namespace Fixtures {
  export function givenAnObject(): any {
    return {
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
  }

  export function givenAnAsyncObject(fromObject: any = givenAnObject()) {
    let result: any = {}

    Object.keys(fromObject).forEach((key) => {
      result[key] = Promise.resolve(fromObject[key])
    })

    return result;
  }
}