import {ViewStyle} from 'react-native';
import {StyleSheet} from 'react-native';

export type GapSizeType =
  | 'xsmall2'
  | 'xsmall'
  | 'small'
  | 'default'
  | 'medium'
  | 'large'
  | 'xlarge';

type ShadowSize = {
  [key in GapSizeType]?: number;
};

type GapStyles = {
  [key in GapSizeType]?: ViewStyle;
};

export const gapSize: ShadowSize = {
  xsmall2: 2,
  xsmall: 4,
  small: 6,
  default: 12,
  medium: 18,
  large: 24,
  xlarge: 30,
};

export const gap = StyleSheet.create<GapStyles>(
  Object.entries(gapSize).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        gap: value,
      } as ViewStyle,
    };
  }, {} as Record<keyof GapSizeType, ViewStyle>),
);
