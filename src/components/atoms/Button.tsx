import {Pressable, PressableProps, Text} from 'react-native';
import {RadiusSizeType, rounded} from '../../styles/BorderRadius';
import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {border} from '../../styles/Border';
import {
  PaddingSizeType,
  horizontalPadding,
  verticalPadding,
} from '../../styles/Padding';

interface Props extends PressableProps, React.RefAttributes<View> {
  text: string;
  rounded?: RadiusSizeType;
  inverted?: boolean;
  verticalPadding?: PaddingSizeType;
  customBackgroundColor?: typeof COLOR.background.green;
  customTextColor?: typeof COLOR.text.green;
  customTextSize?: 'text-base' | 'text-sm' | 'text-xs';
}
export const CustomButton = ({
  text,
  rounded: roundSize = 'default',
  verticalPadding: verticalPaddingSize = 'small',
  inverted = false,
  customBackgroundColor = COLOR.background.green,
  customTextColor = COLOR.text.green,
  customTextSize = 'text-base',
  ...props
}: Props) => {
  return (
    <Pressable
      {...props}
      className="w-full justify-center items-center text-center"
      style={[
        flex.flexRow,
        horizontalPadding.small,
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
        className={`font-bold ${customTextSize}`}
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
