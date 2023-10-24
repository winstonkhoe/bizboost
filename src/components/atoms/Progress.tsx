import {View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect, useState} from 'react';

type StepperType = 'simple';

interface BaseStepperProps {
  currentPosition: number;
  maxPosition: number;
}

interface StepperProps extends BaseStepperProps {
  type?: StepperType;
}

export const Stepper = ({type = 'simple', ...props}: StepperProps) => {
  return <View>{type === 'simple' && <SimpleStepper {...props} />}</View>;
};

const SimpleStepper = ({...props}: BaseStepperProps) => {
  return (
    <View className="h-2" style={[flex.flexRow, gap.small]}>
      {[...Array(props.maxPosition)].map((_, index: number) => {
        return (
          <SimpleStepperBar
            key={index}
            barIndex={index}
            currentPosition={props.currentPosition}
          />
        );
      })}
    </View>
  );
};

interface SimpleStepperBar {
  barIndex: number;
  currentPosition: number;
}

const SimpleStepperBar = ({barIndex, currentPosition}: SimpleStepperBar) => {
  const [parentWidth, setParentWidth] = useState<number>(0);
  const progress = useSharedValue(currentPosition > barIndex ? 1 : 0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [-parentWidth, 0]),
        },
      ],
    };
  });

  useEffect(() => {
    progress.value = withTiming(currentPosition > barIndex ? 1 : 0, {
      duration: 500,
      easing: Easing.inOut(Easing.exp),
    });
  }, [currentPosition, barIndex, progress]);

  return (
    <View
      onLayout={event => {
        const {width} = event.nativeEvent.layout;
        setParentWidth(width);
      }}
      className="flex-1 relative overflow-hidden"
      style={[background(COLOR.background.green.disabled), rounded.medium]}>
      <Animated.View
        className="absolute z-10 top-0 left-0 w-full h-full"
        style={[background(COLOR.background.green.high), animatedStyle]}
      />
    </View>
  );
};
