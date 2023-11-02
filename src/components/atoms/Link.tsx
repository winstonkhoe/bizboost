import {Pressable, PressableProps, Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {FontSizeType, font, fontSize} from '../../styles/Font';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {size} from '../../styles/Size';

interface Props extends PressableProps {
  text: string;
  size?: FontSizeType;
}
const InternalLink = ({text, size: sizeType = 40, ...props}: Props) => {
  const pressed = useSharedValue(false);
  const tap = Gesture.Tap()
    .onBegin(() => {
      pressed.value = true;
    })
    .onFinalize(() => {
      pressed.value = false;
    });
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{scale: withTiming(pressed.value ? 0.7 : 1)}],
  }));
  return (
    <Pressable {...props}>
      <GestureDetector gesture={tap}>
        <Animated.Text
          className="font-bold"
          style={[
            textColor(COLOR.green[60]),
            animatedStyles,
            font.size[sizeType],
          ]}>
          {text}
        </Animated.Text>
      </GestureDetector>
    </Pressable>
  );
};

export {InternalLink};
