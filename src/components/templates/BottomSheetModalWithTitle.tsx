import {View} from 'react-native';
import {padding} from '../../styles/Padding';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {ReactNode} from 'react';
import {AnimatedPressableProps} from '../atoms/AnimatedPressable';
import {BackButtonPlaceholder} from '../molecules/BackButtonPlaceholder';

interface BottomSheetModalWithTitleProps
  extends Partial<AnimatedPressableProps> {
  title: string;
  children?: ReactNode;
  type?: 'default' | 'modal';
}

export const BottomSheetModalWithTitle = ({
  title,
  children,
  type = 'default',
  ...props
}: BottomSheetModalWithTitleProps) => {
  return (
    <View style={[flex.flex1, padding.large, padding.top.default]}>
      <View style={[flex.flex1, flex.flexCol, gap.large]}>
        <View
          style={[
            flex.flexRow,
            type === 'default' && justify.center,
            type === 'modal' && justify.start,
            gap.default,
          ]}>
          <View>
            {type === 'modal' && (
              <BackButtonPlaceholder icon="close" {...props} />
            )}
          </View>
          <Text
            className="font-bold"
            style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
            {title}
          </Text>
        </View>
        {children}
      </View>
    </View>
  );
};
