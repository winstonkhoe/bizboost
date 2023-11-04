import {Pressable, PressableProps, View} from 'react-native';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {border} from '../../styles/Border';
import {Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {rounded} from '../../styles/BorderRadius';
import {flex, items, justify} from '../../styles/Flex';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import {SizeType} from '../../styles/Size';
import {gap} from '../../styles/Gap';
import {AddIcon} from './Icon';
import {padding} from '../../styles/Padding';
import { AnimatedPressable } from './AnimatedPressable';

interface ImageCounterChipProps {
  text?: string | number;
  selected?: boolean;
  size?: SizeType;
}

export const ImageCounterChip = ({
  text,
  selected = false,
  size = 'xlarge',
}: ImageCounterChipProps) => {
  const scale = useSharedValue(1);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  useEffect(() => {
    scale.value = selected
      ? withSequence(withSpring(1.1), withSpring(1))
      : withSpring(1);
  }, [selected, scale]);

  return (
    <Animated.View
      className="overflow-hidden"
      style={[dimension.square[size], rounded.max, animatedStyles]}>
      {selected ? (
        <View
          style={[
            dimension.full,
            background(COLOR.green[30]),
            flex.flexRow,
            justify.center,
            items.center,
          ]}>
          <Text
            className="font-extrabold self-center"
            style={[textColor(COLOR.black[0]), font.size[20]]}>
            {text}
          </Text>
        </View>
      ) : (
        <View
          style={[
            dimension.full,
            rounded.max,
            background(`${COLOR.background.neutral.high}66`),
            border({
              borderWidth: 1,
              color: COLOR.black[0],
            }),
          ]}></View>
      )}
    </Animated.View>
  );
};

interface RemovableChipProps extends PressableProps {
  text?: string | number;
}

export const RemovableChip = ({text, ...props}: RemovableChipProps) => {
  return (
    <AnimatedPressable {...props}>
      <View
        style={[
          flex.flexRow,
          items.center,
          gap.small,
          rounded.max,
          padding.vertical.small,
          padding.horizontal.default,
          background(COLOR.green[5]),
          border({
            borderWidth: 1,
            color: COLOR.green[50],
          }),
        ]}>
        <Text
          className="font-semibold"
          style={[textColor(COLOR.green[50]), font.size[40]]}>
          {text}
        </Text>
        <View className="rotate-45">
          <AddIcon color={COLOR.green[50]} />
        </View>
      </View>
    </AnimatedPressable>
  );
};
