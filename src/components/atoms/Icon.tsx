import {View} from 'react-native';
import {SizeType} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';

interface IconProps {
  size?: SizeType;
  color?: string;
}

export const AddIcon = ({
  size = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  const animatedColor = useSharedValue(color);
  useEffect(() => {
    animatedColor.value = withTiming(color, {
      duration: 300,
    });
  }, [animatedColor, color]);

  const animatedStyleColor = useAnimatedStyle(() => {
    return {
      backgroundColor: animatedColor.value,
    };
  });
  return (
    <View className="relative" style={[dimension.square[size]]}>
      <View
        className="absolute top-0 left-0"
        style={[flex.flexRow, dimension.full, justify.center, items.center]}>
        <Animated.View
          style={[
            dimension.width.full,
            dimension.height.xsmall2,
            animatedStyleColor,
          ]}
        />
      </View>
      <View
        className="absolute top-0 left-0"
        style={[flex.flexRow, dimension.full, justify.center, items.center]}>
        <Animated.View
          style={[
            dimension.height.full,
            dimension.width.xsmall2,
            animatedStyleColor,
          ]}
        />
      </View>
    </View>
  );
};

export const MinusIcon = ({
  size = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  const animatedColor = useSharedValue(color);
  useEffect(() => {
    animatedColor.value = withTiming(color, {
      duration: 300,
    });
  }, [animatedColor, color]);

  const animatedStyleColor = useAnimatedStyle(() => {
    return {
      backgroundColor: animatedColor.value,
    };
  });
  return (
    <View className="relative" style={[dimension.square[size]]}>
      <View
        className="absolute top-0 left-0"
        style={[flex.flexRow, dimension.full, justify.center, items.center]}>
        <Animated.View
          style={[
            dimension.width.full,
            dimension.height.xsmall2,
            animatedStyleColor,
          ]}
        />
      </View>
    </View>
  );
};
