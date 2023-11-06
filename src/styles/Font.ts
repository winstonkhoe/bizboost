import {StyleSheet, TextStyle} from 'react-native';

export type FontSizeType =
  | 10
  | 20
  | 30
  | 40
  | 50
  | 60
  | 70
  | 80
  | 90
  | 100
  | 110
  | 120;

export type LineHeightType = 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90;

type Size = {
  [key in FontSizeType]: number;
};

type LineHeights = {
  [key in LineHeightType]: number;
};

export type FontSizeStyle = {
  [key in FontSizeType]?: TextStyle;
};

export type LineHeightStyle = {
  [key in LineHeightType]?: TextStyle;
};

export const fontSize: Size = {
  10: 10,
  20: 12,
  30: 14,
  40: 16,
  50: 18,
  60: 20,
  70: 24,
  80: 32,
  90: 40,
  100: 48,
  110: 56,
  120: 64,
};

export const lineHeight: LineHeights = {
  10: 14,
  20: 16,
  30: 18,
  40: 20,
  50: 22,
  60: 24,
  70: 28,
  80: 38,
  90: 48,
};

export const font = {
  size: StyleSheet.create<FontSizeStyle>(
    Object.entries(fontSize).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          fontSize: value,
        } as TextStyle,
      };
    }, {} as FontSizeStyle),
  ),
  lineHeight: StyleSheet.create<LineHeightStyle>(
    Object.entries(lineHeight).reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: {
          lineHeight: value,
        } as TextStyle,
      };
    }, {} as LineHeightStyle),
  ),
};
