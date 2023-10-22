import {Pressable, PressableProps, Text} from 'react-native';
import {RadiusSizeType, rounded} from '../../styles/BorderRadius';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {border} from '../../styles/Border';
import {PaddingSizeType, verticalPadding} from '../../styles/Padding';

interface Props extends PressableProps, React.RefAttributes<View> {
  text: string;
  rounded?: RadiusSizeType;
  inverted?: boolean;
  verticalPadding?: PaddingSizeType;
  customBackgroundColor?: typeof COLOR.background.green;
  customTextColor?: typeof COLOR.text.green;
}
export const CustomButton = ({
  text,
  rounded: roundSize = 'default',
  verticalPadding: verticalPaddingSize = 'small',
  inverted = false,
  customBackgroundColor = COLOR.background.green,
  customTextColor = COLOR.text.green,
  ...props
}: Props) => {
  return (
    <Pressable
      {...props}
      className="w-full justify-center items-center text-center px-6"
      style={[
        flex.flexRow,
        verticalPadding[verticalPaddingSize],
        rounded[roundSize],
        inverted &&
          border({
            borderWidth: 2,
            color: props.disabled
              ? customBackgroundColor.disabled
              : customBackgroundColor.high,
          }),
        inverted && background(COLOR.black[0]),
        !inverted &&
          background(
            props.disabled
              ? customBackgroundColor.disabled
              : customBackgroundColor.high,
          ),
      ]}>
      <Text
        className="font-bold text-base"
        style={[
          inverted
            ? textColor(
                props.disabled
                  ? customTextColor.disabled
                  : customTextColor.default,
              )
            : textColor(COLOR.black[1]),
        ]}>
        {text}
      </Text>
    </Pressable>
  );
};
