import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, ViewProps} from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  cancelAnimation,
  withRepeat,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {rounded} from '../../styles/BorderRadius';
import {flex} from '../../styles/Flex';

interface SkeletonPlaceholderProps extends ViewProps {
  children: React.ReactNode;
  isLoading: boolean;
  width?: number;
  height?: number;
}

export const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> = ({
  children,
  isLoading,
  width,
  height,
  ...props
}) => {
  const animation = useSharedValue(-1);
  const ref = useRef<View>(null);
  const [dimensions, setDimensions] = React.useState({width: 0, height: 0});

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {duration: 1000, easing: Easing.inOut(Easing.ease)}),
      -1,
      false,
      () => {
        animation.value = -1;
      },
    );
  }, [animation]);

  useEffect(() => {
    ref.current?.measure((x, y, width, height) => {
      setDimensions({width, height});
    });
  }, [children]);

  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: (width || dimensions.width) * animation.value}],
    };
  });

  return (
    <View
      {...props}
      style={[
        isLoading && [
          styles.container,
          {
            width:
              width || (dimensions.width > 0 ? dimensions.width : undefined),
            height:
              height || (dimensions.height > 0 ? dimensions.height : undefined),
          },
          rounded.small,
        ],
        props.style,
      ]}>
      <View ref={ref} style={{opacity: isLoading ? 0 : 1}}>
        {children}
      </View>
      {isLoading && (
        <Animated.View style={[StyleSheet.absoluteFill, reanimatedStyle]}>
          <LinearGradient
            colors={['#E0E0E0', '#F0F0F0', '#E0E0E0']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  skeleton: {
    backgroundColor: '#E0E0E0',
    position: 'absolute',
  },
});
