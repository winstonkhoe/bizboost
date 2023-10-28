import {Pressable, PressableProps, Text, View} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {COLOR} from '../../styles/Color';
import {useCallback, useEffect} from 'react';
import {SocialData, SocialPlatform} from '../../model/User';
import {formatNumberWithThousandSeparator} from '../../utils/number';
import {flex} from '../../styles/Flex';
import {Badge} from '../atoms/Badge';
import {padding} from '../../styles/Padding';
import {gap} from '../../styles/Gap';
import {rounded} from '../../styles/BorderRadius';
import InstagramLogo from '../../assets/vectors/instagram.svg';
import TiktokLogo from '../../assets/vectors/tiktok.svg';
import {textColor} from '../../styles/Text';

interface SocialPlatformProps extends PressableProps {
  platform: SocialPlatform;
  isSelected: boolean;
  error?: boolean;
}

interface SocialSummaryProps extends SocialPlatformProps {
  data?: SocialData;
}

export const SocialPlatformChip = ({
  isSelected,
  platform,
  error = false,
  ...props
}: SocialPlatformProps) => {
  const getTargetValue = useCallback(() => {
    if (isSelected) {
      if (error) {
        return -1;
      }
      return 1;
    }
    return 0;
  }, [isSelected, error]);
  const selectedProgress = useSharedValue(getTargetValue());

  useEffect(() => {
    selectedProgress.value = withTiming(getTargetValue(), {
      duration: 300,
    });
  }, [isSelected, selectedProgress, getTargetValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        selectedProgress.value,
        [-1, 0, 1],
        [COLOR.red[50], COLOR.black[25], COLOR.green[50]],
      ),
      backgroundColor: interpolateColor(
        selectedProgress.value,
        [-1, 0, 1],
        [COLOR.red[1], COLOR.black[0], COLOR.green[1]],
      ),
    };
  });
  return (
    <Pressable {...props}>
      <Animated.View
        style={[
          flex.flexCol,
          gap.default,
          padding.small,
          rounded.default,
          {
            borderWidth: 1,
          },
          animatedStyle,
        ]}>
        <View className="items-center" style={[flex.flexRow, gap.xsmall]}>
          <View>
            {SocialPlatform.Instagram === platform && (
              <InstagramLogo width={25} height={25} />
            )}
            {SocialPlatform.Tiktok === platform && (
              <TiktokLogo width={25} height={25} />
            )}
          </View>
          <Text
            className="font-semibold"
            style={[textColor(COLOR.text.neutral.med)]}>
            {platform}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

export const SocialSummary = ({
  platform,
  isSelected,
  data,
  ...props
}: SocialSummaryProps) => {
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);
  useEffect(() => {
    selectedProgress.value = withTiming(isSelected ? 1 : 0, {
      duration: 300,
    });
  }, [isSelected, selectedProgress]);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [COLOR.black[25], COLOR.green[50]],
      ),
      backgroundColor: interpolateColor(
        selectedProgress.value,
        [0, 1],
        [COLOR.black[0], COLOR.green[1]],
      ),
    };
  });
  return (
    <Pressable className="w-40" {...props}>
      <Animated.View
        style={[
          flex.flexCol,
          gap.default,
          padding.small,
          rounded.default,
          {
            borderWidth: 1,
          },
          animatedStyle,
        ]}>
        <View className="items-center" style={[flex.flexRow, gap.xsmall]}>
          <View>
            {SocialPlatform.Instagram === platform && (
              <InstagramLogo width={25} height={25} />
            )}
            {SocialPlatform.Tiktok === platform && (
              <TiktokLogo width={25} height={25} />
            )}
          </View>
          <View className="flex-1 justify-start" style={[flex.flexRow]}>
            {data?.username && <Badge text={`@${data.username}`} />}
          </View>
        </View>
        <View className="items-center" style={[flex.flexCol]}>
          <Text className="font-semibold">
            {data?.followersCount
              ? formatNumberWithThousandSeparator(data?.followersCount)
              : '-'}
          </Text>
          <Text className="text-xs">Followers</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};
