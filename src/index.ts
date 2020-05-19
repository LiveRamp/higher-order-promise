type NoPromise<T> = T extends Promise<infer U> ? U : T
type AwaitedProperties<T> = T extends Promise<infer U> ? U : { [Key in keyof T]: NoPromise<T[Key]> }

export class Async<T> {
  private underlying: Promise<T>

  private constructor(o: Promise<T>) {
    this.underlying = o
  }

  static of<T>(o: T) {
    return new Async(this.objectToPromise(o))
  }

  then<NewValueType>(
    f: (t: AwaitedProperties<T>) => NewValueType
  ): Async<NewValueType> {
    return new Async(new Promise((resolve, reject) => {
      this.underlying.then((v) => {
        let mapResultPromise = Async.objectToPromise(f(v as AwaitedProperties<T>))
        mapResultPromise.then((mapResult) => {
          resolve(mapResult)
        }).catch((e) => reject(e))
      }).catch((e) => reject(e))
    }))
  }

  async yield(): Promise<AwaitedProperties<T>> {
    return await this.underlying as AwaitedProperties<T>
  }

  private static objectToPromise<T>(o: T): Promise<T> {
    if (typeof o == "object") {
      if (o instanceof Promise) {
        return o;
      } else {
        let objectPropertiesPromises: Promise<[keyof T, any]>[] = Object.keys(o).reduce((acc, curr) => {
          let key = curr as keyof T
          let value = o[key]
          if (value instanceof Promise) {
            acc.push(value.then((v) => [key, v]))
          } else {
            acc.push(Promise.resolve([key, value]))
          }
          return acc
        }, [] as Promise<[keyof T, any]>[])

        return Promise.all(objectPropertiesPromises).then((data) => {
          return data.reduce((acc, curr) => {
            acc[curr[0]] = curr[1]

            return acc;
          }, {} as any)
        })
      }
    } else {
      return Promise.resolve(o)
    }
  }
}