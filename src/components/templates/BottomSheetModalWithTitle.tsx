import {View} from 'react-native';
import {padding} from '../../styles/Padding';
import {flex, justify, self} from '../../styles/Flex';
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
import {size} from '../../styles/Size';

interface BottomSheetModalWithTitleProps
  extends Partial<BackButtonPlaceholderProps> {
  title: string;
  children?: ReactNode;
  type?: 'default' | 'modal';
  showIcon?: boolean;
  fullHeight?: boolean;
}

export const BottomSheetModalWithTitle = ({
  title,
  children,
  type = 'default',
  fullHeight = false,
  showIcon = false,
  icon = 'close',
  ...props
}: BottomSheetModalWithTitleProps) => {
  return (
    <View style={[fullHeight && flex.flex1, padding.bottom.large]}>
      <View style={[fullHeight && flex.flex1, flex.flexCol]}>
        <View
          style={[
            padding.default,
            padding.top.medium,
            gap.default,
            {
              borderBottomWidth: 0.5,
              borderColor: COLOR.black[10],
            },
          ]}>
          <View
            style={[
              flex.flexRow,
              type === 'default' && justify.center,
              type === 'modal' && [justify.start],
              {
                position: 'relative',
              },
            ]}>
            {(showIcon || type === 'modal') && (
              <View
                style={[
                  {
                    position: 'absolute',
                    left: 0,
                    top: -size.small,
                  },
                ]}>
                <BackButtonPlaceholder {...props} icon={icon} />
              </View>
            )}
            <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
              {title}
            </Text>
          </View>
        </View>
        {children}
      </View>
    </View>
  );
};
