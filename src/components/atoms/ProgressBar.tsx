import {Text, View} from 'react-native';
import {flex, items} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';
import {textColor} from '../../styles/Text';
import {dimension} from '../../styles/Dimension';
import {font} from '../../styles/Font';

type ProgressBarType = 'default';

interface BaseProgressBarProps {
  currentProgress: number;
  showProgressNumber?: boolean;
}

interface ProgressBarProps extends BaseProgressBarProps {
  type?: ProgressBarType;
}

export const ProgressBar = ({type = 'default', ...props}: ProgressBarProps) => {
  return <View>{type === 'default' && <DefaultProgressBar {...props} />}</View>;
};

const DefaultProgressBar = ({...props}: BaseProgressBarProps) => {
  const progressValue = useSharedValue<number>(props.currentProgress);
  const animatedProgressWidth = useAnimatedStyle(() => {
    return {
      width: `${100 * progressValue.value}%`,
    };
  });

  useEffect(() => {
    progressValue.value = withTiming(props.currentProgress, {
      duration: 150,
    });
  }, [props.currentProgress, progressValue]);

  return (
    <View style={[flex.flexRow, gap.default, items.center]}>
      <View
        className="relative"
        style={[
          flex.flex1,
          dimension.height.small,
          rounded.medium,
          background(COLOR.green[10]),
        ]}>
        <Animated.View
          className="absolute top-0 left-0"
          style={[
            dimension.height.full,
            animatedProgressWidth,
            rounded.medium,
            background(COLOR.green[50]),
          ]}
        />
      </View>
      {props.showProgressNumber && (
        <Text
          className="font-semibold"
          style={[
            textColor(COLOR.text.neutral.med),
            font.size[30],
          ]}>{`${Math.round(props.currentProgress * 100)}%`}</Text>
      )}
    </View>
  );
};
