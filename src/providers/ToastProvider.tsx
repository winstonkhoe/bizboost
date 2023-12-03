import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {dimension} from '../styles/Dimension';
import {padding} from '../styles/Padding';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {background} from '../styles/BackgroundColor';
import {DeviceEventEmitter, Text} from 'react-native';
import {View} from 'react-native';
import {COLOR} from '../styles/Color';
import {rounded} from '../styles/BorderRadius';
import {size} from '../styles/Size';
import {textColor} from '../styles/Text';
import {font} from '../styles/Font';
import {useEffect, useState} from 'react';
import {ShowToastProps} from '../helpers/toast';

export enum ToastType {
  danger = 'danger',
  success = 'success',
  warning = 'warning',
  info = 'info',
}

type ColorToastTypeMap = {
  [key in ToastType]: {
    background: string;
    textColor: string;
  };
};

const animationDuration = 300;

const colorToastTypeMap: ColorToastTypeMap = {
  [ToastType.danger]: {
    background: COLOR.red[60],
    textColor: COLOR.black[0],
  },
  [ToastType.success]: {
    background: COLOR.green[50],
    textColor: COLOR.black[0],
  },
  [ToastType.warning]: {
    background: COLOR.yellow[40],
    textColor: COLOR.black[0],
  },
  [ToastType.info]: {
    background: COLOR.black[70],
    textColor: COLOR.black[0],
  },
};

const ToastProvider = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const [currentToast, setCurrentToast] = useState<ShowToastProps | null>(null);
  const showToast = useSharedValue(currentToast === null ? 0 : 1);

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener(
      'show.toast',
      (toast: ShowToastProps) => {
        setCurrentToast(toast);
      },
    );

    return () => {
      listener.remove();
    };
  }, []);

  const showToastStyle = useAnimatedStyle(() => {
    return {
      bottom: interpolate(
        showToast.value,
        [0, 1],
        [0, Math.max(safeAreaInsets.bottom, size.large)],
      ),
      opacity: interpolate(showToast.value, [0, 1], [0, 1]),
    };
  });

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (currentToast !== null) {
      showToast.value = withSequence(
        withTiming(1, {duration: animationDuration}),
        withDelay(
          currentToast.duration || 0,
          withTiming(0, {duration: animationDuration}),
        ),
      );
      timeout = setTimeout(() => {
        setCurrentToast(null);
        currentToast.onClose?.();
      }, (currentToast?.duration || 0) + animationDuration * 2); // toast duration, animationDuration in + out
    }
    return () => {
      if (currentToast !== null) {
        clearTimeout(timeout);
        cancelAnimation(showToast);
      }
    };
  }, [currentToast, showToast]);

  return (
    <Animated.View
      style={[
        showToastStyle,
        dimension.width.full,
        padding.horizontal.default,
        {
          zIndex: 1000,
          position: 'absolute',
        },
      ]}>
      {currentToast && (
        <View
          style={[
            background(
              colorToastTypeMap[currentToast.type || ToastType.info].background,
            ),
            padding.default,
            rounded.default,
          ]}>
          <Text
            style={[
              font.size[30],
              textColor(
                colorToastTypeMap[currentToast.type || ToastType.info]
                  .textColor,
              ),
            ]}>
            {currentToast.message}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default ToastProvider;
