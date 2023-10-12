import {ViewStyle} from 'react-native';
import {hex2rgba} from '../utils/color';
import {clamp} from '../utils/number';

interface Props {
  borderWidth?: number;
  color: string;
  opacity?: number;
}
export const border = ({borderWidth, color, opacity}: Props): ViewStyle => {
  return {
    borderWidth: borderWidth,
    borderColor: hex2rgba({
      hex: color,
      alpha: opacity ? clamp(opacity, 0, 1) : undefined,
    }),
  };
};
