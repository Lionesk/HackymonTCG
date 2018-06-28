
export async function asyncCall<T>(name: string, ...args: any[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    Meteor.call(name, ...args, (error, result) => {
      if (error) {
        console.log("error: ", error)
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}
