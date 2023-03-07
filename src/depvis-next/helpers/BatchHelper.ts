/**
 * Function that helps process large arrays of data in smaller batches. Useful for doing batch requests
 * @param inputList List of object that are sliced and used as input to @param fn.
 * @param fn Function called on smaller batches
 * @param chunkSize How many items are used per one batch. Default is 10
 * @returns Concatenated results of each function call.
 */

export type processBatchOptions = {
  fnArg2?: any;
  updateProgressFn?: Function;
  message?: any;
  chunkSize: number;
};
export async function processBatchAsync<T>(
  inputList: any[],
  fn: Function,
  options: processBatchOptions
): Promise<T> {
  if (!inputList) return;
  let res = [];
  const chunkSize = options.chunkSize || 10;
  try {
    for (let i = 0; i < inputList.length; i += chunkSize) {
      if (options.updateProgressFn) {
        options.updateProgressFn((i / inputList.length) * 100, options.message);
      }
      const chunk = inputList.slice(i, i + chunkSize);
      const chunkRes = await fn(chunk, options.fnArg2);
      res = res.concat(chunkRes);
    }
  } catch (error) {
    console.error("While processing batch, error was encountered!");
    console.error(error);
  }
  console.log("Total items processed %d", res.length);
  return res as T;
}
