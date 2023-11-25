import {Text, View} from 'react-native';
import {FontSizeType, font} from '../../styles/Font';
import {rounded} from '../../styles/BorderRadius';
import {useMemo} from 'react';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import {textColor} from '../../styles/Text';

export enum StatusType {
  success = 'success',
  danger = 'danger',
  warning = 'warning',
}

type Props = {
  status: string;
  fontSize?: FontSizeType;
  statusType?: StatusType;
};
const StatusTag = ({
  status,
  fontSize = 10,
  statusType = StatusType.warning,
}: Props) => {
  // TODO: fix colors, bedain per status?
  const isWarning = useMemo(
    () => statusType === StatusType.warning,
    [statusType],
  );
  const isDanger = useMemo(
    () => statusType === StatusType.danger,
    [statusType],
  );
  const isSuccess = useMemo(
    () => statusType === StatusType.success,
    [statusType],
  );
  return (
    <View
      style={[
        // background(COLOR.background.green.low),
        rounded.small,
        isWarning && [
          background(COLOR.yellow[5]),
          border({
            borderWidth: 1,
            color: COLOR.yellow[50],
          }),
        ],
        isDanger && [
          background(COLOR.red[5]),
          border({
            borderWidth: 1,
            color: COLOR.red[50],
          }),
        ],
        isSuccess && [
          background(COLOR.green[5]),
          border({
            borderWidth: 1,
            color: COLOR.green[70],
          }),
        ],
      ]}
      className="px-2 py-1">
      <Text
        style={[
          font.size[fontSize],
          isWarning && [textColor(COLOR.yellow[70])],
          isDanger && [textColor(COLOR.red[50])],
          isSuccess && [textColor(COLOR.green[70])],
        ]}
        className="font-semibold">
        {status}
      </Text>
    </View>
  );
};

export default StatusTag;
