import {StyleSheet, Text} from 'react-native';
import {RadiusSizeType, rounded} from '../../styles/BorderRadius';
import {View} from 'react-native';
import {flex, items, justify, self} from '../../styles/Flex';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {border} from '../../styles/Border';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {ReactNode} from 'react';
import {SizeType} from '../../styles/Size';
import Animated from 'react-native-reanimated';
import {AnimatedPressable, AnimatedPressableProps} from './AnimatedPressable';
import {FontSizeType, font} from '../../styles/Font';

type Prominence = 'primary' | 'secondary' | 'tertiary';

interface ColorProps {
  default: string;
  disabled: string;
}

export interface CustomButtonProps
  extends Partial<AnimatedPressableProps>,
    React.RefAttributes<View> {
  text: string;
  rounded?: RadiusSizeType;
  type?: Prominence;
  verticalPadding?: SizeType;
  customBackgroundColor?: ColorProps;
  customTextColor?: ColorProps;
  customTextSize?: FontSizeType;
  minimumWidth?: boolean;
  logo?: ReactNode;
}

const borderWidth = 2;

export const CustomButton = ({
  text,
  rounded: roundSize = 'default',
  verticalPadding: verticalPaddingSize = 'default',
  type = 'primary',
  customBackgroundColor,
  customTextColor,
  customTextSize = 30,
  minimumWidth = false,
  logo,
  ...props
}: CustomButtonProps) => {
  const isPrimary = type === 'primary';
  const isSecondary = type === 'secondary';
  const isTertiary = type === 'tertiary';
  const defaultBackgroundColor = {
    default: COLOR.background.green.high,
    disabled: COLOR.background.green.disabled,
  };
  const defaultTextColor = {
    default: COLOR.black[1],
    disabled: COLOR.black[1],
  };

  const getActiveBackgroundColor = (defaultColor: ColorProps) => {
    return props.disabled ? defaultColor.disabled : defaultColor.default;
  };
  const getBackgroundColorOrDefault = (defaultColor: ColorProps) => {
    if (customBackgroundColor) {
      return getActiveBackgroundColor(customBackgroundColor);
    }
    return getActiveBackgroundColor(defaultColor);
  };

  const getActiveTextColor = (defaultColor: ColorProps) => {
    return props.disabled ? defaultColor.disabled : defaultColor.default;
  };
  const getTextColorOrDefault = (defaultColor: ColorProps) => {
    if (customTextColor) {
      return getActiveTextColor(customTextColor);
    }
    return getActiveTextColor(defaultColor);
  };
  return (
    <AnimatedPressable {...props}>
      <Animated.View
        className="relative"
        style={[
          flex.flexRow,
          justify.center,
          items.center,
          minimumWidth && self.center,
          horizontalPadding.large,
          verticalPadding[verticalPaddingSize],
          rounded[roundSize],
          isPrimary && [
            styles.invisibleBorder,
            background(getBackgroundColorOrDefault(defaultBackgroundColor)),
          ],
          isSecondary && [
            border({
              borderWidth: borderWidth,
              color: getBackgroundColorOrDefault(defaultBackgroundColor),
            }),
            background(
              getBackgroundColorOrDefault({
                default: COLOR.black[0],
                disabled: COLOR.black[0],
              }),
            ),
          ],
          isTertiary && [
            background(
              getBackgroundColorOrDefault({
                default: COLOR.black[0],
                disabled: COLOR.black[0],
              }),
            ),
          ],
        ]}>
        {logo && (
          <View
            className="absolute left-4 w-8"
            style={[flex.flexRow, justify.center, items.center]}>
            {logo}
          </View>
        )}
        <Text
          className="font-bold"
          style={[
            isPrimary && [textColor(getTextColorOrDefault(defaultTextColor))],
            isSecondary && [textColor(getTextColorOrDefault(COLOR.text.green))],
            isTertiary && [textColor(getTextColorOrDefault(COLOR.text.green))],
            font.size[customTextSize],
          ]}>
          {text}
        </Text>
      </Animated.View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  invisibleBorder: {
    borderWidth: borderWidth,
    borderColor: 'transparent',
  },
});
