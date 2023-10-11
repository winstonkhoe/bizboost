import {ViewStyle} from 'react-native';
import {hex2rgba} from '../utils/color';
import {clamp} from '../utils/number';

export const background = (color: string, opacity?: number): ViewStyle => {
  return {
    backgroundColor: hex2rgba({
      hex: color,
      alpha: opacity ? clamp(opacity, 0, 1) : undefined,
    }),
  };
};
