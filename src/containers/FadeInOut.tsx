import {ReactNode, useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface FadeInOutProps {
  visible: boolean;
  duration?: number;
  children: ReactNode;
}

export const FadeInOut = ({
  visible,
  duration = 150,
  children,
}: FadeInOutProps) => {
  const isVisible = useSharedValue(visible ? 1 : 0);

  const visibleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: isVisible.value,
    };
  });

  useEffect(() => {
    isVisible.value = withTiming(visible ? 1 : 0, {
      duration: duration,
    });
  }, [visible, isVisible, duration]);

  return (
    <Animated.View style={[visibleAnimatedStyle]}>{children}</Animated.View>
  );
};
