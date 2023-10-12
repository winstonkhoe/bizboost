export const clamp = (value: number, min: number, max: number) => {
  return value > max ? max : value < min ? min : value;
};
