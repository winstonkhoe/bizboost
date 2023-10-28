import {StyleSheet, ViewStyle} from 'react-native';
import {SizeStyle, SizeType, size} from './Size';

export const dimension = {
  ...StyleSheet.create({
    full: {
      width: '100%',
      height: '100%',
    },
  }),
  square: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          width: value,
          height: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  width: {
    ...StyleSheet.create<SizeStyle>(
      Object.entries(size).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: {
            width: value,
          } as ViewStyle,
        };
      }, {} as Record<keyof SizeType, ViewStyle>),
    ),
    full: {
      width: '100%',
    } as ViewStyle,
  },
  height: {
    ...StyleSheet.create<SizeStyle>(
      Object.entries(size).reduce((acc, [key, value]) => {
        return {
          ...acc,
          [key]: {
            height: value,
          } as ViewStyle,
        };
      }, {} as Record<keyof SizeType, ViewStyle>),
    ),
    full: {
      height: '100%',
    } as ViewStyle,
  },
};
