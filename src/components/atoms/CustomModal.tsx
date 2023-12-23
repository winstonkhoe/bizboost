import {Modal, ModalProps} from 'react-native';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {ReactNode, useEffect} from 'react';
import {rounded} from '../../styles/BorderRadius';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {padding} from '../../styles/Padding';
import {border} from '../../styles/Border';

interface CustomModalProps extends ModalProps {
  children: ReactNode;
  removeDefaultBackground?: boolean;
  removeDefaultPadding?: boolean;
}

export const CustomModal = ({
  children,
  removeDefaultBackground = false,
  removeDefaultPadding = false,
  ...props
}: CustomModalProps) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    scale.value = withTiming(props.visible ? 1 : 0.8, {duration: 200});
    opacity.value = withTiming(props.visible ? 1 : 0, {duration: 200});
  }, [props.visible, opacity, scale]);

  return (
    <Modal animationType="fade" {...props}>
      <Animated.View
        style={[
          flex.flex1,
          justify.center,
          gap.default,
          animatedBackgroundStyle,
          !removeDefaultPadding && padding.horizontal.xlarge,
          background(COLOR.absoluteBlack[100], 0.7),
        ]}>
        <Animated.View
          style={[
            rounded.default,
            animatedModalStyle,
            border({
              borderWidth: 2,
              color: COLOR.black[10],
              opacity: 0.5,
            }),
            !removeDefaultBackground && background(COLOR.black[0]),
          ]}>
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
