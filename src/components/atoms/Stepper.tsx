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
import React, {Children, ReactNode, useEffect, useState} from 'react';
import {textColor} from '../../styles/Text';
import {dimension} from '../../styles/Dimension';
import {padding} from '../../styles/Padding';
import {border} from '../../styles/Border';

interface BaseStepperProps {
  currentPosition: number;
  maxPosition: number;
}

interface StepperProps extends BaseStepperProps {
  type?: 'simple';
}

export const Stepper = ({type = 'simple', ...props}: StepperProps) => {
  return <View>{type === 'simple' && <SimpleStepper {...props} />}</View>;
};

const SimpleStepper = ({...props}: BaseStepperProps) => {
  return (
    <View style={[flex.flexCol, gap.small, padding.vertical.xlarge]}>
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

export enum StepperState {
  success = 'success',
  danger = 'danger',
  warning = 'warning',
  inProgress = 'inProgress',
  upcoming = 'upcoming',
  terminated = 'terminated',
}

interface ContentStepperProps extends BaseStepperProps {
  decreasePreviousVisibility?: boolean; //currently only support content stepper
  stepperStates?: StepperState[];
  children?: ReactNode;
}

export const ContentStepper = ({
  decreasePreviousVisibility = true,
  stepperStates = [],
  ...props
}: ContentStepperProps) => {
  const children = Children.toArray(props.children);
  return (
    <View style={[flex.flexCol, gap.small]}>
      {children.map((child: ReactNode, index: number) => {
        const isUpcoming =
          !stepperStates[index] ||
          StepperState.upcoming === stepperStates[index];
        const isSuccess =
          !isUpcoming && StepperState.success === stepperStates[index];
        const isDanger =
          !isUpcoming && StepperState.danger === stepperStates[index];
        const isWarning =
          !isUpcoming && StepperState.warning === stepperStates[index];
        const isInProgress =
          !isUpcoming && StepperState.inProgress === stepperStates[index];
        const isTerminated =
          !isUpcoming && StepperState.terminated === stepperStates[index];
        return (
          <View key={index} style={[flex.flexRow, gap.default]}>
            <View style={[flex.flexCol, gap.small, items.center]}>
              <View
                style={[
                  dimension.square.large,
                  isUpcoming && background(COLOR.black[20]),
                  isSuccess && background(COLOR.green[50]),
                  isDanger && background(COLOR.red[50]),
                  isWarning && background(COLOR.yellow[30]),
                  isInProgress && [
                    border({
                      borderWidth: 2,
                      color: COLOR.green[50],
                    }),
                    background(COLOR.background.neutral.default),
                  ],
                  isTerminated && background(COLOR.black[70]),
                  index < props.currentPosition && {
                    opacity: 0.5,
                  },
                  rounded.max,
                ]}
              />
              <View
                style={[
                  flex.flex1,
                  index < props.currentPosition
                    ? [background(COLOR.green[50])]
                    : [background(COLOR.black[20])],
                  index < props.currentPosition && {
                    opacity: 0.5,
                  },
                  dimension.width.xsmall,
                  rounded.max,
                ]}
              />
            </View>
            <View
              className="relative"
              style={[
                flex.flex1,
                padding.bottom.large,
                // index < props.currentPosition && {
                //   opacity: 0.5,
                // },
                // index === props.currentPosition && {
                //   opacity: 1,
                // },
                // index > props.currentPosition && {
                //   opacity: 0.5,
                // },
              ]}>
              {((decreasePreviousVisibility && index < props.currentPosition) ||
                index > props.currentPosition) && (
                <View
                  className="absolute z-10 top-0 left-0"
                  style={[
                    dimension.full,
                    background(COLOR.black[0], 0.5),
                    rounded.medium,
                  ]}
                />
              )}
              {child}
            </View>
          </View>
        );
      })}
    </View>
  );
};
