import {ColorValue} from 'react-native';
import {ViewStyle} from 'react-native';

export const background = (color: ColorValue): ViewStyle => {
  return {
    backgroundColor: color,
  };
};
