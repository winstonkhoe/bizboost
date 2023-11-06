export const clamp = (value: number, min: number, max: number) => {
  return value > max ? max : value < min ? min : value;
};

export const formatNumberWithThousandSeparator = (
  value: number,
  separator: string = '.',
) => {
  if (!value) return value;
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};
