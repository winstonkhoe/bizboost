import {StyleSheet, ViewStyle} from 'react-native';
import {COLOR} from './Color';

export type ShadowSizeType =
  | 'small'
  | 'default'
  | 'medium'
  | 'large'
  | 'xlarge';

type ShadowSize = {
  [key in ShadowSizeType]?: number;
};

type ShadowStyles = {
  [key in ShadowSizeType]?: ViewStyle;
};

export const shadowSize: ShadowSize = {
  small: 2,
  default: 4,
  medium: 6,
  large: 8,
  xlarge: 10,
};

export const shadow = StyleSheet.create<ShadowStyles>(
  Object.entries(shadowSize).reduce((acc, [key, value]) => {
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
  }, {} as Record<keyof ShadowSizeType, ViewStyle>),
);
