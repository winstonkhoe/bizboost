import {StyleSheet, ViewStyle} from 'react-native';
import {SizeStyle, SizeType, size} from './Size';

export const padding = StyleSheet.create<SizeStyle>(
  Object.entries(size).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        padding: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof SizeType, ViewStyle>),
);

export const horizontalPadding = StyleSheet.create<SizeStyle>(
  Object.entries(size).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        paddingHorizontal: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof SizeType, ViewStyle>),
);

export const verticalPadding = StyleSheet.create<SizeStyle>(
  Object.entries(size).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        paddingVertical: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof SizeType, ViewStyle>),
);
