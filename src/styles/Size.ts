import {ViewStyle} from 'react-native';

export type SizeType =
  | 'xsmall2'
  | 'xsmall'
  | 'small'
  | 'default'
  | 'medium'
  | 'large'
  | 'xlarge'
  | 'xlarge2'
  | 'xlarge3'
  | 'xlarge4'
  | 'xlarge5'
  | 'xlarge6'
  | 'xlarge7';

type Size = {
  [key in SizeType]: number;
};

export type SizeStyle = {
  [key in SizeType]?: ViewStyle;
};

export const size: Size = {
  xsmall2: 2,
  xsmall: 4,
  small: 6,
  default: 12,
  medium: 18,
  large: 24,
  xlarge: 30,
  xlarge2: 42,
  xlarge3: 60,
  xlarge4: 78,
  xlarge5: 96,
  xlarge6: 114,
  xlarge7: 132,
};
