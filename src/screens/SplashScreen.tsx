import {Text, View, useWindowDimensions} from 'react-native';
import Logo from '../assets/vectors/content-creator_business-people.svg';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {flex, items, justify} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {gap} from '../styles/Gap';
import {font} from '../styles/Font';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';

interface SplashScreenProps {
  visible: boolean;
  dissolveDuration?: number;
}

const SplashScreen = ({visible, dissolveDuration = 500}: SplashScreenProps) => {
  const windowDimension = useWindowDimensions();
  const opacity = useSharedValue(visible ? 1 : 0);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {duration: dissolveDuration});
  }, [visible, opacity, dissolveDuration]);

  return (
    <Animated.View
      className="absolute z-10 top-0 left-0"
      style={[
        {
          width: windowDimension.width,
          height: windowDimension.height,
        },
        animatedBackgroundStyle,
        flex.flex1,
        flex.flexCol,
        gap.medium,
        items.center,
        justify.center,
        background(COLOR.green[1]),
      ]}>
      <Logo width={300} height={300} />
      <Text
        className="font-extrabold"
        style={[textColor(COLOR.green[30]), font.size[110]]}>
        biz<Text style={[textColor(COLOR.red[50])]}>boost</Text>
      </Text>
    </Animated.View>
  );
};

export default SplashScreen;
