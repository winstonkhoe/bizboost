import {View} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {dimension} from '../../styles/Dimension';

export const Seperator = () => {
  return (
    <View
      style={[
        background(COLOR.background.neutral.med),
        dimension.height.default,
      ]}
    />
  );
};
