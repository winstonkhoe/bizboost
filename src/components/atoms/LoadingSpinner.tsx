import React from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {COLOR} from '../../styles/Color';

export const LoadingSpinner = () => {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);

  const animatedStyles1 = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotation1.value}deg`}],
    };
  });

  const animatedStyles2 = useAnimatedStyle(() => {
    return {
      transform: [{rotate: `${rotation2.value}deg`}],
    };
  });

  React.useEffect(() => {
    rotation1.value = withRepeat(
      withTiming(360, {duration: 2000, easing: Easing.linear}),
      -1,
    );
    rotation2.value = withDelay(
      1000,
      withRepeat(withTiming(360, {duration: 1000, easing: Easing.linear}), -1),
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, animatedStyles1]} />
      <Animated.View style={[styles.innerSpinner, animatedStyles2]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  spinner: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: COLOR.green[70],
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  innerSpinner: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: COLOR.green[50],
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});
