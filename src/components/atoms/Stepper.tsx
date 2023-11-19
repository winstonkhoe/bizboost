import {Text, View} from 'react-native';
import {flex, items} from '../../styles/Flex';
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
import React, {
  Children,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import {textColor} from '../../styles/Text';
import {dimension} from '../../styles/Dimension';
import {padding} from '../../styles/Padding';

type StepperType = 'simple' | 'content';

interface BaseStepperProps {
  currentPosition: number;
  maxPosition: number;
  children?: ReactNode;
}

interface StepperProps extends BaseStepperProps {
  type?: StepperType;
}

export const Stepper = ({type = 'simple', ...props}: StepperProps) => {
  return (
    <View>
      {type === 'simple' && <SimpleStepper {...props} />}
      {type === 'content' && <ContentStepper {...props} />}
    </View>
  );
};

const SimpleStepper = ({...props}: BaseStepperProps) => {
  return (
    <View style={[flex.flexCol, gap.small]}>
      <View className="justify-end" style={[flex.flexRow]}>
        <Text>
          <Text
            className="font-bold text-base"
            style={[textColor(COLOR.text.neutral.high)]}>
            {props.currentPosition}
          </Text>
          <Text
            className="font-semibold text-base"
            style={[
              textColor(COLOR.text.neutral.low),
            ]}>{` of ${props.maxPosition}`}</Text>
        </Text>
      </View>
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
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
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

const ContentStepper = ({...props}: BaseStepperProps) => {
  const children = Children.toArray(props.children);
  return (
    <View style={[flex.flexCol, gap.small]}>
      {children.map((child: ReactNode, index: number) => {
        return (
          <View key={index} style={[flex.flexRow, gap.default]}>
            <View style={[flex.flexCol, gap.small, items.center]}>
              <View
                style={[
                  dimension.square.xlarge2,
                  background(
                    props.currentPosition >= index
                      ? COLOR.green[50]
                      : COLOR.black[20],
                  ),
                  index < props.currentPosition && {
                    opacity: 0.5,
                  },
                  rounded.max,
                ]}
              />
              <View
                style={[
                  flex.flex1,
                  background(
                    props.currentPosition - 1 >= index
                      ? COLOR.green[50]
                      : COLOR.black[20],
                  ),
                  index < props.currentPosition && {
                    opacity: 0.5,
                  },
                  dimension.width.xsmall,
                  rounded.max,
                ]}
              />
            </View>
            <View
              style={[
                flex.flex1,
                padding.bottom.large,
                index < props.currentPosition && {
                  opacity: 0.5,
                },
                index === props.currentPosition && {
                  opacity: 1,
                },
                index > props.currentPosition && {
                  opacity: 0.5,
                },
              ]}>
              {child}
            </View>
          </View>
        );
      })}
    </View>
  );
};
