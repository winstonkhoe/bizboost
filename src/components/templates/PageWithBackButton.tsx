import {ReactNode, useEffect, useMemo, useState} from 'react';
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
import {border} from '../../styles/Border';
import {size} from '../../styles/Size';

interface Props extends PressableProps {
  children: ReactNode;
  icon?: 'back' | 'close';
  backButtonPlaceholder?: ReactNode;
  underBackButtonPlaceholder?: ReactNode;
  showBackButtonPlaceholderOnThreshold?: boolean;
  fullHeight?: boolean;
  disableDefaultOnPress?: boolean;
  enableSafeAreaContainer?: boolean;
  threshold?: number;
  withoutScrollView?: boolean;
}

export const PageWithBackButton = ({
  children,
  icon = 'back',
  backButtonPlaceholder,
  underBackButtonPlaceholder,
  fullHeight = false,
  disableDefaultOnPress = false,
  enableSafeAreaContainer = false,
  threshold,
  showBackButtonPlaceholderOnThreshold = false,
  withoutScrollView = false,
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

  const showBackButtonPlaceholder = useMemo(() => {
    if (!showBackButtonPlaceholderOnThreshold) {
      return true;
    }
    return exceedThreshold;
  }, [exceedThreshold, showBackButtonPlaceholderOnThreshold]);

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
      <View
        className="absolute z-10"
        style={[dimension.width.full, flex.flex1, flex.flexCol]}>
        <Animated.View
          style={[
            flex.flex1,
            flex.flexRow,
            gap.default,
            items.center,
            justify.start,
            padding.horizontal.default,
            padding.bottom.small,
            {
              paddingTop: Math.max(insets.top, size.medium),
            },
            menuStyle,
            exceedThreshold &&
              border({
                borderWidth: 0.5,
                color: COLOR.black[100],
                opacity: 0.2,
              }),
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
          {showBackButtonPlaceholder && backButtonPlaceholder && (
            <View
              style={[
                flex.flex1,
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
        {underBackButtonPlaceholder}
      </View>
      {withoutScrollView ? (
        <PageWithBackButtonChildren
          enableSafeAreaContainer={enableSafeAreaContainer}>
          {children}
        </PageWithBackButtonChildren>
      ) : (
        <ScrollView
          bounces={false}
          scrollEventThrottle={threshold !== undefined ? 8 : 0}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={fullHeight && [flex.grow]}
          onScroll={e => {
            threshold && handleScroll(e);
          }}>
          <PageWithBackButtonChildren
            enableSafeAreaContainer={enableSafeAreaContainer}>
            {children}
          </PageWithBackButtonChildren>
        </ScrollView>
      )}
    </View>
  );
};

interface PageWithBackButtonChildrenProps {
  enableSafeAreaContainer: boolean;
  children?: ReactNode;
}

const PageWithBackButtonChildren = ({
  enableSafeAreaContainer,
  children,
}: PageWithBackButtonChildrenProps) => {
  return (
    <SafeAreaContainer enable={enableSafeAreaContainer}>
      {children}
    </SafeAreaContainer>
  );
};
