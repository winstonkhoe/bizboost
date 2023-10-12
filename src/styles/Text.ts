import {TextStyle} from 'react-native';
import {hex2rgba} from '../utils/color';
import {clamp} from 'react-native-reanimated';

export const textColor = (color: string, opacity?: number): TextStyle => {
  return {
    color: hex2rgba({
      hex: color,
      alpha: opacity ? clamp(opacity, 0, 1) : undefined,
    }),
  };
};
