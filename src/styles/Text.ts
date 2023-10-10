import {ColorValue, TextStyle} from 'react-native';

export const textColor = (color: ColorValue): TextStyle => {
  return {
    color: color,
  };
};
