import {Pressable, PressableProps, Text} from 'react-native';
import {RadiusSizeType, rounded} from '../../styles/BorderRadius';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {border} from '../../styles/Border';

interface Props extends PressableProps, React.RefAttributes<View> {
  text: string;
  rounded?: RadiusSizeType;
  inverted?: boolean;
}
export const CustomButton = ({
  text,
  rounded: roundSize = 'default',
  inverted = false,
  ...props
}: Props) => {
  return (
    <Pressable
      {...props}
      className="w-full justify-center items-center text-center px-6 py-3"
      style={[
        flex.flexRow,
        rounded[roundSize],
        inverted &&
          border({
            borderWidth: 2,
            color: props.disabled
              ? COLOR.background.green.disabled
              : COLOR.background.green.high,
          }),
        inverted && background(COLOR.black[0]),
        !inverted &&
          background(
            props.disabled
              ? COLOR.background.green.disabled
              : COLOR.background.green.high,
          ),
      ]}>
      <Text
        className="font-bold text-base"
        style={[
          inverted
            ? textColor(
                props.disabled
                  ? COLOR.text.green.disabled
                  : COLOR.text.green.default,
              )
            : textColor(COLOR.black[1]),
        ]}>
        {text}
      </Text>
    </Pressable>
  );
};
