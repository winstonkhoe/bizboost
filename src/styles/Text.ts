import {TextStyle} from 'react-native';
import {rgba2hex} from '../utils/color';
import {clamp} from 'react-native-reanimated';

export const textColor = (color: string, opacity?: number): TextStyle => {
  return {
    color: rgba2hex({
      rgba: color,
      alpha: opacity ? clamp(opacity, 0, 1) : undefined,
    }),
  };
};
