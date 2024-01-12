export const shuffle = <T>(array: T[]): T[] => {
  return array
    .map(value => ({value, sort: Math.random()}))
    .sort((a, b) => a.sort - b.sort)
    .map(({value}) => value);
};

export const chunkArray = <T>(array: T[], chunkSize: number) => {
  return Array.from({length: Math.ceil(array.length / chunkSize)}, (v, i) =>
    array.slice(i * chunkSize, i * chunkSize + chunkSize),
  );
};

export const filterAsync = async <T>(
  array: T[],
  predicate: (value: T) => Promise<boolean>,
): Promise<T[]> => {
  const results: (T | null)[] = await Promise.all(
    array.map(async item => ((await predicate(item)) ? item : null)),
  );
  return results.filter((result): result is T => result !== null) as T[];
};
