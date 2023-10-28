import {StyleSheet, ViewStyle} from 'react-native';
import {COLOR} from './Color';
import {SizeStyle, SizeType, size} from './Size';

export const shadow = StyleSheet.create<SizeStyle>(
  Object.entries(size).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        shadowColor: COLOR.black[100],
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: value,
        elevation: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof SizeType, ViewStyle>),
);
