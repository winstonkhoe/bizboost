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

export const formatNumberWithSuffix = (number: number): string => {
  if (number < 1000) {
    return number.toString();
  } else if (number < 1000000) {
    return `${(number / 1000).toFixed(1)}K`;
  } else if (number < 1000000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  } else if (number < 1000000000000) {
    return `${(number / 1000000000).toFixed(1)}B`;
  } else {
    return `${(number / 1000000000000).toFixed(1)}T`;
  }
};
