import {Text, View} from 'react-native';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';

interface Props {
  text: string;
}
export const Badge = ({text}: Props) => {
  return (
    <View
      style={[
        rounded.medium,
        background(COLOR.green[50]),
        horizontalPadding.small,
        verticalPadding.xsmall2,
      ]}>
      <Text
        numberOfLines={1}
        className="font-bold text-xs"
        style={[textColor(COLOR.black[0])]}>
        {text}
      </Text>
    </View>
  );
};
