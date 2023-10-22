import {StyleSheet, ViewStyle} from 'react-native';

export type PaddingSizeType =
  | 'xsmall2'
  | 'xsmall'
  | 'small'
  | 'default'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'max';

type PaddingSize = {
  [key in PaddingSizeType]?: number;
};

type PaddingStyles = {
  [key in PaddingSizeType]?: ViewStyle;
};

export const paddingSize: PaddingSize = {
  xsmall2: 2,
  xsmall: 4,
  small: 8,
  default: 16,
  medium: 24,
  large: 32,
  xlarge: 40,
};

export const padding = StyleSheet.create<PaddingStyles>(
  Object.entries(paddingSize).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        padding: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof PaddingSizeType, ViewStyle>),
);

export const horizontalPadding = StyleSheet.create<PaddingStyles>(
  Object.entries(paddingSize).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        paddingHorizontal: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof PaddingSizeType, ViewStyle>),
);

export const verticalPadding = StyleSheet.create<PaddingStyles>(
  Object.entries(paddingSize).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        paddingVertical: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof PaddingSizeType, ViewStyle>),
);
