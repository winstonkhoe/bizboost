import {Pressable, View} from 'react-native';
import {
  AnimatedPressable,
  AnimatedPressableProps,
} from '../atoms/AnimatedPressable';
import {flex, items} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {rounded} from '../../styles/BorderRadius';
import {padding} from '../../styles/Padding';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {Text} from 'react-native';
import {background} from '../../styles/BackgroundColor';
import {AddIcon} from '../atoms/Icon';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';

interface FieldArrayLabelProps extends Partial<AnimatedPressableProps> {
  type: 'add' | 'field';
  text: string;
  isDisabled?: boolean;
  onRemovePress?: () => void; //only for type field
}

export const FieldArrayLabel = ({
  type,
  text,
  isDisabled = false,
  onRemovePress,
  ...props
}: FieldArrayLabelProps) => {
  return (
    <AnimatedPressable {...props}>
      <View
        style={[
          flex.flexRow,
          items.center,
          gap.small,
          rounded.default,
          padding.vertical.small,
          padding.horizontal.default,
          type === 'add' &&
            border({
              borderWidth: 1,
              color: COLOR.black[25],
            }),
          type === 'field' &&
            border({
              borderWidth: 1,
              color: COLOR.green[50],
            }),
          isDisabled && [
            background(COLOR.background.neutral.disabled),
            border({
              borderWidth: 1,
              color: COLOR.black[20],
            }),
          ],
        ]}
        className="max-w-[95vw]">
        <Text
          className="font-semibold max-w-[80vw]"
          style={[
            type === 'add' && textColor(COLOR.text.neutral.med),
            type === 'field' && textColor(COLOR.green[60]),
            isDisabled && textColor(COLOR.text.neutral.disabled),
            font.size[30],
          ]}>
          {text}
        </Text>
        {type === 'add' && (
          <View
            style={[rounded.max, background(COLOR.black[30]), padding.xsmall]}>
            <AddIcon size="default" color={COLOR.black[0]} />
          </View>
        )}
        {type === 'field' && (
          <Pressable
            style={[
              {
                transform: [{rotate: '45deg'}],
              },
              rounded.max,
              background(COLOR.background.danger.high),
              isDisabled && [background(COLOR.background.danger.disabled)],
              padding.xsmall,
            ]}
            onPress={onRemovePress}>
            <AddIcon size="default" color={COLOR.absoluteBlack[0]} />
          </Pressable>
        )}
      </View>
    </AnimatedPressable>
  );
};
