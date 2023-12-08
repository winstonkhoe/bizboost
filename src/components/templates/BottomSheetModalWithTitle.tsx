import {View} from 'react-native';
import {padding} from '../../styles/Padding';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {ReactNode} from 'react';
import {
  BackButtonPlaceholder,
  BackButtonPlaceholderProps,
} from '../molecules/BackButtonPlaceholder';

interface BottomSheetModalWithTitleProps
  extends Partial<BackButtonPlaceholderProps> {
  title: string;
  children?: ReactNode;
  type?: 'default' | 'modal';
  fullHeight?: boolean;
}

export const BottomSheetModalWithTitle = ({
  title,
  children,
  type = 'default',
  fullHeight = false,
  icon = 'close',
  ...props
}: BottomSheetModalWithTitleProps) => {
  return (
    <View
      style={[fullHeight && flex.flex1, padding.large, padding.top.default]}>
      <View style={[fullHeight && flex.flex1, flex.flexCol, gap.large]}>
        <View
          style={[
            flex.flexRow,
            type === 'default' && justify.center,
            type === 'modal' && justify.start,
            gap.default,
          ]}>
          <View>
            {type === 'modal' && (
              <BackButtonPlaceholder {...props} icon={icon} />
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
