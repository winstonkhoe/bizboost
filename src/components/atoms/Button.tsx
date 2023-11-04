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
import {ReactNode} from 'react';
import {SizeType} from '../../styles/Size';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {AnimatedPressable} from './AnimatedPressable';

interface Props extends PressableProps, React.RefAttributes<View> {
  text: string;
  rounded?: RadiusSizeType;
  inverted?: boolean;
  verticalPadding?: SizeType;
  customBackgroundColor?: typeof COLOR.background.green;
  customTextColor?: typeof COLOR.text.green;
  customTextSize?: 'text-base' | 'text-sm' | 'text-xs';
  minimumWidth?: boolean;
  logo?: ReactNode;
}
export const CustomButton = ({
  text,
  rounded: roundSize = 'default',
  verticalPadding: verticalPaddingSize = 'default',
  inverted = false,
  customBackgroundColor = COLOR.background.green,
  customTextColor = COLOR.text.green,
  customTextSize = 'text-base',
  minimumWidth = false,
  logo,
  ...props
}: Props) => {
  return (
    <AnimatedPressable {...props}>
      <Animated.View
        className="justify-center items-center text-center relative"
        style={[
          flex.flexRow,
          minimumWidth && {alignSelf: 'center'},
          horizontalPadding.large,
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
        {logo && (
          <View
            className="absolute top-1/2 left-4 w-8 h-full justify-center items-center"
            style={[flex.flexRow]}>
            {logo}
          </View>
        )}
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
      </Animated.View>
    </AnimatedPressable>
  );
};
