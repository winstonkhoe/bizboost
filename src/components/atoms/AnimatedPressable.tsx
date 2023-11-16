import {ReactNode} from 'react';
import {Pressable, PressableProps} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface AnimatedPressableProps extends PressableProps {
  scale?: number;
  children: ReactNode;
}

export const AnimatedPressable = ({
  scale = 0.75,
  children,
  ...props
}: AnimatedPressableProps) => {
  return (
    <AnimatedTap scale={props.disabled ? 1 : scale}>
      <Pressable {...props}>{children}</Pressable>
    </AnimatedTap>
  );
};

interface AnimatedTapProps {
  scale?: number;
  children: ReactNode;
}

export const AnimatedTap = ({scale = 0.75, children}: AnimatedTapProps) => {
  const pressed = useSharedValue(false);

  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
    });
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{scale: withTiming(pressed.value ? scale : 1)}],
  }));
  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[animatedStyles]}>{children}</Animated.View>
    </GestureDetector>
  );
};
