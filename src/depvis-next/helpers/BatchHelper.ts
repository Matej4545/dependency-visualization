export async function processBatch<T>(
  inputList: any[],
  fn: Function,
  chunkSize: number = 10
) {
  if (!inputList) return;
  let res = [];
  for (let i = 0; i < inputList.length; i += chunkSize) {
    const chunk = inputList.slice(i, i + chunkSize);
    const chunkRes = await fn(chunk);
    res = res.concat(chunkRes);
  }
  console.log("Total items processed %d", res.length);
  return res;
}
