import {View} from 'react-native';
import {SizeType, size} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import InstagramMono from '../../assets/vectors/instagram-mono.svg';
import TiktokMono from '../../assets/vectors/tiktok-mono.svg';
import {SocialPlatform} from '../../model/User';
import Svg, {Path} from 'react-native-svg';

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

export const InstagramIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  return (
    <InstagramMono
      width={size[sizeType]}
      height={size[sizeType]}
      color={color}
    />
  );
};

export const TiktokIcon = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  return (
    <TiktokMono width={size[sizeType]} height={size[sizeType]} color={color} />
  );
};

export interface PlatformIconProps extends IconProps {
  platform: SocialPlatform;
}

export const PlatformIcon = ({platform, ...props}: PlatformIconProps) => {
  switch (platform) {
    case SocialPlatform.Instagram:
      return <InstagramIcon {...props} />;
    case SocialPlatform.Tiktok:
      return <TiktokIcon {...props} />;
    default:
      return null;
  }
};

export const ChevronRight = ({
  size: sizeType = 'default',
  color = COLOR.black[100],
}: IconProps) => {
  const dimension = size[sizeType];
  return (
    <Svg
      width={dimension}
      height={dimension}
      viewBox={`0 0 ${dimension} ${dimension}`}>
      <Path
        d={`M ${dimension * 0.2} ${dimension * 0.2} L ${dimension * 0.5} ${
          dimension * 0.5
        } ${dimension * 0.2} ${dimension * 0.8}`}
        stroke={color}
        strokeWidth="2"
        fill="transparent"
      />
    </Svg>
  );
};

interface IconArrowProps extends IconProps {
  type?: 'default' | 'singleSided';
}

export const ArrowIcon = ({
  type = 'default',
  size: sizeType = 'default',
  color = COLOR.black[100],
}: IconArrowProps) => {
  const dimension = size[sizeType];
  return (
    <Svg
      height={dimension}
      width={dimension}
      viewBox={`0 0 ${dimension * 2} ${dimension * 2}`}>
      <Path
        d={`M0 12L22 12M15 5l7 7-${type === 'default' ? 7 : 99999} 7`}
        stroke={color}
        fill="transparent"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
};
