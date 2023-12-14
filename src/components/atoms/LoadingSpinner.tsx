import {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {COLOR} from '../../styles/Color';
import Svg, {Path, SvgProps} from 'react-native-svg';
import {SizeType, size} from '../../styles/Size';
import {dimension} from '../../styles/Dimension';

interface LoadingSpinnerProps {
  primaryColor?: string;
  secondaryColor?: string;
  size?: SizeType;
}

export const LoadingSpinner = ({
  primaryColor = COLOR.green[70],
  secondaryColor = COLOR.green[50],
  size: sizeType = size.xlarge,
}: LoadingSpinnerProps) => {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(180);

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

  useEffect(() => {
    rotation1.value = withRepeat(
      withTiming(360, {duration: 1000, easing: Easing.linear}),
      -1,
    );
    rotation2.value = withRepeat(
      withTiming(360 + 180, {duration: 500, easing: Easing.linear}),
      -1,
    );
    return () => {
      cancelAnimation(rotation1);
      cancelAnimation(rotation2);
    };
  }, []);

  return (
    <View style={[styles.container, dimension.square[sizeType]]}>
      <Animated.View style={[styles.spinner, animatedStyles1]}>
        <HalfCircle stroke={primaryColor} />
      </Animated.View>
      <Animated.View style={[styles.innerSpinner, animatedStyles2]}>
        <HalfCircle stroke={secondaryColor} />
      </Animated.View>
    </View>
  );
};

const HalfCircle = ({...props}: SvgProps) => (
  <Svg height="100%" width="100%" viewBox="0 0 100 100">
    <Path
      d="M50 50 m -40, 0 a 40,40 0 1,0 80,0"
      stroke={props.stroke}
      strokeWidth="10"
      fill="transparent"
    />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    position: 'relative',
  },
  spinner: {
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    height: '100%',
  },
  innerSpinner: {
    position: 'absolute',
    zIndex: 5,
    width: '100%',
    height: '100%',
  },
});
