import {AnimatableNumericValue, StyleSheet, ViewStyle} from 'react-native';

interface BorderRadiusProps {
  topLeft?: AnimatableNumericValue;
  topRight?: AnimatableNumericValue;
  bottomLeft?: AnimatableNumericValue;
  bottomRight?: AnimatableNumericValue;
}

export type RadiusSizeType =
  | 'small'
  | 'default'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'max';

type RadiusSize = {
  [key in RadiusSizeType]?: number;
};

type RadiusStyles = {
  [key in RadiusSizeType]?: ViewStyle;
};

export const borderRadius = ({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}: BorderRadiusProps): ViewStyle => {
  return {
    borderTopLeftRadius: topLeft,
    borderTopRightRadius: topRight,
    borderBottomLeftRadius: bottomLeft,
    borderBottomRightRadius: bottomRight,
  };
};

export const radiusSize: RadiusSize = {
  small: 4,
  default: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  max: 9999,
};

export const rounded = StyleSheet.create<RadiusStyles>(
  Object.entries(radiusSize).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: {
        borderRadius: value,
      },
    };
  }, {}),
);
