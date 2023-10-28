import {StyleSheet, ViewStyle} from 'react-native';
import {SizeStyle, SizeType, size} from './Size';

export const padding = {
  ...StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          padding: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  vertical: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          paddingVertical: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  horizontal: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          paddingHorizontal: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  top: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          paddingTop: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  right: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          paddingRight: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  left: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          paddingLeft: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
  bottom: StyleSheet.create<SizeStyle>(
    Object.entries(size).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          paddingBottom: value,
        } as ViewStyle,
      };
    }, {} as Record<keyof SizeType, ViewStyle>),
  ),
};

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
