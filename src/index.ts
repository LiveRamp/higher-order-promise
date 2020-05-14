type NoPromise<T> = T extends Promise<infer U> ? U : T;
type AwaitedProperties<T> = T extends Promise<infer U>
  ? U
  : { [Key in keyof T]: NoPromise<T[Key]> };

export class HigherOrderPromise<T> {
  private underlying: Promise<T>;

  private constructor(o: Promise<T>) {
    this.underlying = o;
  }

  static of<T>(o: T) {
    return new HigherOrderPromise(this.objectToPromise(o));
  }

  then<NewValueType>(
    f: (t: AwaitedProperties<T>) => NewValueType
  ): HigherOrderPromise<NewValueType> {
    return new HigherOrderPromise(
      new Promise((resolve, reject) => {
        this.underlying
          .then((v) => {
            let mapResultPromise = HigherOrderPromise.objectToPromise(
              f(v as AwaitedProperties<T>)
            );
            mapResultPromise
              .then((mapResult) => {
                resolve(mapResult);
              })
              .catch((e) => reject(e));
          })
          .catch((e) => reject(e));
      })
    );
  }

  async yield(): Promise<AwaitedProperties<T>> {
    return (await this.underlying) as AwaitedProperties<T>;
  }

  private static objectToPromise<T>(o: T): Promise<T> {
    if (typeof o == "object") {
      if (o instanceof Promise) {
        return o;
      } else {
        let wasArray = Array.isArray(o);

        let objectPropertiesPromises: Promise<[keyof T, any]>[] = Object.keys(
          o
        ).reduce((acc, curr) => {
          let key = curr as keyof T;
          let value = o[key];
          if (value instanceof Promise) {
            acc.push(value.then((v) => [key, v]));
          } else {
            acc.push(Promise.resolve([key, value]));
          }
          return acc;
        }, [] as Promise<[keyof T, any]>[]);

        const result = Promise.all(objectPropertiesPromises).then((data) => {
          return data.reduce((acc, curr) => {
            acc[curr[0]] = curr[1];

            return acc;
          }, {} as any);
        });

        // Could probably improve this, is to support the case of an array
        // being passed thru - want to preserve its array-ness.

        if (Array.isArray(o))
          return result.then((data) => (Object.values(data) as unknown) as T);
        else return result;
      }
    } else {
      return Promise.resolve(o);
    }
  }
}
