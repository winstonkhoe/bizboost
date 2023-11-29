import {ModalProps, View} from 'react-native';
import {flex, items, justify} from '../styles/Flex';
import {Modal} from 'react-native';
import {ReactNode, useEffect} from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {background} from '../styles/BackgroundColor';
import {gap} from '../styles/Gap';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {LoadingSpinner} from '../components/atoms/LoadingSpinner';

interface LoadingScreenProps extends ModalProps {
  children?: ReactNode;
}

export const LoadingScreen = ({
  children,
  transparent = true,
  visible = true,
  ...props
}: LoadingScreenProps) => {
  const opacity = useSharedValue(0);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    console.log('loading screen opacity');
    opacity.value = withTiming(visible ? 1 : 0, {duration: 200});
  }, [visible, opacity]);

  return (
    <Modal
      visible={visible}
      transparent={transparent}
      animationType="none"
      {...props}>
      <Animated.View
        style={[
          flex.flex1,
          flex.flexCol,
          items.center,
          justify.center,
          gap.default,
          animatedBackgroundStyle,
          background(`${COLOR.black[0]}a3`),
        ]}>
        <View
          style={[
            flex.flexCol,
            padding.vertical.large,
            padding.horizontal.xlarge3,
            rounded.medium,
            items.center,
            justify.center,
            gap.medium,
          ]}>
          <LoadingSpinner />
          {children ? children : null}
        </View>
      </Animated.View>
    </Modal>
  );
};
