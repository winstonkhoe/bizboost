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
  return (
    <View
      style={[background(COLOR.background.green.low), rounded.small]}
      className="px-2 py-1">
      <Text
        style={[font.size[20], textColor(COLOR.text.green.default)]}
        className="font-semibold">
        {status}
      </Text>
    </View>
  );
};

export default StatusTag;
