import {Text, View} from 'react-native';
import {FontSizeType, font} from '../../styles/Font';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import {textColor} from '../../styles/Text';

export enum StatusType {
  success = 'success',
  danger = 'danger',
  warning = 'warning',
  terminated = 'terminated',
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
  const isWarning = statusType === StatusType.warning;
  const isDanger = statusType === StatusType.danger;
  const isSuccess = statusType === StatusType.success;
  const isTerminated = statusType === StatusType.terminated;
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
        isTerminated && [
          background(COLOR.black[10]),
          border({
            borderWidth: 1,
            color: COLOR.black[70],
          }),
        ],
      ]}
      className="px-2 py-1">
      <Text
        style={[
          font.size[fontSize],
          isWarning && [textColor(COLOR.yellow[50])],
          isDanger && [textColor(COLOR.red[50])],
          isSuccess && [textColor(COLOR.green[70])],
          isTerminated && [textColor(COLOR.black[50])],
        ]}
        className="font-bold">
        {status}
      </Text>
    </View>
  );
};

export default StatusTag;
