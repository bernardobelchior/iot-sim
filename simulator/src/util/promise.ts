import * as Bluebird from "bluebird";

export function toNativePromise<T>(bluebird: Bluebird<T>): Promise<T> {
  return new Promise((resolve, reject) => bluebird.then(resolve).catch(reject));
}
