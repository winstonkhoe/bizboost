import {Text, View} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {font} from '../../styles/Font';
import {rounded} from '../../styles/BorderRadius';
import {textColor} from '../../styles/Text';

type Props = {
  status: string;
};
const StatusTag = ({status}: Props) => {
  // TODO: fix colors, bedain per status?
  return (
    <View
      style={[
        // background(COLOR.background.green.low),
        rounded.small,
      ]}
      className="px-2 py-1 bg-yellow-200">
      <Text
        style={[
          font.size[20],
          // textColor(COLOR.text.green.default)
        ]}
        className="font-semibold text-yellow-600">
        {status}
      </Text>
    </View>
  );
};

export default StatusTag;
