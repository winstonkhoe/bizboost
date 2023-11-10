import {ReactNode, useEffect, useState} from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex, items, justify} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import {BackButtonPlaceholder} from '../molecules/BackButtonPlaceholder';
import {useNavigation} from '@react-navigation/native';
import {NativeScrollEvent, PressableProps, View} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {dimension} from '../../styles/Dimension';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeSyntheticEvent} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {gap} from '../../styles/Gap';

interface Props extends PressableProps {
  children: ReactNode;
  icon?: 'back' | 'close';
  backButtonPlaceholder?: ReactNode;
  showBackButtonPlaceholderOnThreshold?: boolean;
  fullHeight?: boolean;
  disableDefaultOnPress?: boolean;
  enableSafeAreaContainer?: boolean;
  threshold?: number;
}

export const PageWithBackButton = ({
  children,
  icon = 'back',
  backButtonPlaceholder,
  fullHeight = false,
  disableDefaultOnPress = false,
  enableSafeAreaContainer = false,
  threshold,
  showBackButtonPlaceholderOnThreshold = false,
  ...props
}: Props) => {
  const [exceedThreshold, setExceedThreshold] = useState(false);
  const topMenuOpacity = useSharedValue(exceedThreshold ? 1 : 0);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (threshold) {
      const currentScrollPositionY = event.nativeEvent.contentOffset.y;
      if (!exceedThreshold && currentScrollPositionY >= threshold) {
        setExceedThreshold(true);
      } else if (exceedThreshold && currentScrollPositionY < threshold) {
        setExceedThreshold(false);
      }
    }
  };

  const showBackButtonPlaceholder = () => {
    if (!showBackButtonPlaceholderOnThreshold) {
      return true;
    }
    return exceedThreshold;
  };

  useEffect(() => {
    topMenuOpacity.value = withTiming(exceedThreshold ? 1 : 0, {
      duration: 150,
    });
  }, [topMenuOpacity, exceedThreshold]);

  const menuStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        topMenuOpacity.value,
        [0, 1],
        ['transparent', COLOR.black[0]],
      ),
    };
  });

  return (
    <View className="flex-1 relative">
      <Animated.View
        className="absolute z-10"
        style={[
          dimension.width.full,
          flex.flexRow,
          gap.default,
          items.center,
          justify.start,
          padding.horizontal.default,
          padding.bottom.small,
          {
            paddingTop: insets.top,
          },
          menuStyle,
        ]}>
        <View
          style={[
            background(`${COLOR.black[0]}c3`),
            dimension.square.xlarge2,
            rounded.max,
          ]}>
          <BackButtonPlaceholder
            icon={icon}
            onPress={
              disableDefaultOnPress
                ? props.onPress
                : () => {
                    navigation.goBack();
                  }
            }
          />
        </View>
        {showBackButtonPlaceholder() && backButtonPlaceholder && (
          <View
            style={[
              flex.flexRow,
              items.center,
              gap.default,
              rounded.max,
              padding.small,
              background(COLOR.black[0]),
            ]}>
            {backButtonPlaceholder}
          </View>
        )}
      </Animated.View>
      <ScrollView
        bounces={false}
        scrollEventThrottle={threshold !== undefined ? 8 : 0}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={fullHeight && [flex.grow]}
        onScroll={e => {
          threshold && handleScroll(e);
        }}>
        <SafeAreaContainer enable={enableSafeAreaContainer}>
          {children}
        </SafeAreaContainer>
      </ScrollView>
    </View>
  );
};
