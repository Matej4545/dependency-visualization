const getKeys = async (q) => {
  const multi = q.multi();
  multi.keys("*");
  const keys = await multi.exec();
  return keys[0][1];
};

const filterQueueKeys = (q, keys) => {
  const prefix = `${q.keyPrefix}:${q.name}`;
  return keys.filter((k) => k.includes(prefix));
};

const deleteKeys = async (q, keys) => {
  const multi = q.multi();
  keys.forEach((k) => multi.del(k));
  await multi.exec();
};

export const emptyQueue = async (q) => {
  const keys = await getKeys(q);
  const queueKeys = filterQueueKeys(q, keys);
  await deleteKeys(q, queueKeys);
  console.log(`Queue ${q.name} is empty`);
};
