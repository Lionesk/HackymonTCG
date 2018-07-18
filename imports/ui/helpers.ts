
export async function asyncCall<T>(name: string, ...args: any[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    Meteor.call(name, ...args, (error: Meteor.Error, result: T) => {
      if (error) {
        console.log("error: ", error)
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
