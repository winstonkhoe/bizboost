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
