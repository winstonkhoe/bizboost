import {View} from 'react-native';
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
