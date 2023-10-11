import {ViewStyle} from 'react-native';
import {hex2rgba} from '../utils/color';
import {clamp} from '../utils/number';

export const background = (color: string, opacity: number = 1): ViewStyle => {
  return {
    backgroundColor: hex2rgba({
      hex: color,
      alpha: clamp(opacity, 0, 1),
    }),
  };
};
