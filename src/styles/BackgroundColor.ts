import {ViewStyle} from 'react-native';
import {rgba2hex} from '../utils/color';
import {clamp} from '../utils/number';

export const background = (color: string, opacity?: number): ViewStyle => {
  return {
    backgroundColor: rgba2hex({
      rgba: color,
      alpha: opacity ? clamp(opacity, 0, 1) : undefined,
    }),
  };
};
