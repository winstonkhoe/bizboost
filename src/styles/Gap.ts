import {ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';
import {SizeStyle, SizeType, size} from './Size';

export const gap = StyleSheet.create<SizeStyle>(
  Object.entries(size).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        gap: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof SizeType, ViewStyle>),
);
