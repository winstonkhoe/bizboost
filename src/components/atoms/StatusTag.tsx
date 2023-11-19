import {Text, View} from 'react-native';
import {font} from '../../styles/Font';
import {rounded} from '../../styles/BorderRadius';

export enum StatusType {
  success = 'success',
  danger = 'danger',
  warning = 'warning',
}

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
      className="px-2 py-1 bg-yellow-200 border border-yellow-400">
      <Text
        style={[
          font.size[10],
          // textColor(COLOR.text.green.default)
        ]}
        className="font-semibold text-yellow-600">
        {status}
      </Text>
    </View>
  );
};

export default StatusTag;
