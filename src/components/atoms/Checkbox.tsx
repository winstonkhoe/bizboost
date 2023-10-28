import {View} from 'react-native';
import {border} from '../../styles/Border';
import {rounded} from '../../styles/BorderRadius';
import {COLOR} from '../../styles/Color';
import {SizeType} from '../../styles/Size';
import {size} from '../../styles/Size';
import {background} from '../../styles/BackgroundColor';
import {flex} from '../../styles/Flex';
import CheckMark from '../../assets/vectors/checkmark.svg';

interface Props {
  size?: SizeType;
  checked: boolean;
}

export const Checkbox = ({size: sizeType = 'large', checked}: Props) => {
  const numberSize = size[sizeType];
  const checkMarkScale = 1;
  return (
    <View
      className="items-center justify-center"
      style={[
        flex.flexRow,
        rounded.small,
        {
          width: numberSize,
          height: numberSize,
        },
        background(checked ? COLOR.green[50] : COLOR.black[0]),
        border({
          borderWidth: 2,
          color: COLOR.green[50],
        }),
      ]}>
      {checked && (
        <CheckMark
          width={checkMarkScale * numberSize}
          height={checkMarkScale * numberSize}
          color={COLOR.black[0]}
        />
      )}
    </View>
  );
};
