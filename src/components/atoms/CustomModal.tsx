import {Modal, ModalProps} from 'react-native';
import {View} from 'react-native';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {HorizontalPadding} from './ViewPadding';
import {ReactNode, useEffect} from 'react';
import {rounded} from '../../styles/BorderRadius';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface CustomModalProps extends ModalProps {
  children: ReactNode;
}

export const CustomModal = ({children, ...props}: CustomModalProps) => {
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
    <View style={[flex.flex1]}>
      <Modal animationType="fade" {...props}>
        <Animated.View
          style={[
            flex.flex1,
            justify.center,
            gap.default,
            animatedBackgroundStyle,
            background(`${COLOR.black[100]}d0`),
          ]}>
          <HorizontalPadding paddingSize="xlarge">
            <Animated.View
              style={[
                rounded.default,
                animatedModalStyle,
                background(COLOR.black[0]),
              ]}>
              {children}
            </Animated.View>
          </HorizontalPadding>
        </Animated.View>
      </Modal>
    </View>
  );
};
