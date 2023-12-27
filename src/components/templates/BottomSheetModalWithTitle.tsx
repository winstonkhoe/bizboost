import {View} from 'react-native';
import {padding} from '../../styles/Padding';
import {flex, items, justify, self} from '../../styles/Flex';
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
import {BackButtonLabel} from '../atoms/Header';
import {dimension} from '../../styles/Dimension';

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
  const isDefault = type === 'default';
  const isModal = type === 'modal';
  return (
    <View style={[fullHeight && flex.flex1, padding.bottom.large]}>
      <View style={[fullHeight && flex.flex1, flex.flexCol]}>
        <View
          style={[
            padding.default,
            gap.default,
            {
              borderBottomWidth: 0.5,
              borderColor: COLOR.black[10],
            },
          ]}>
          <View
            style={[
              flex.flexRow,
              items.center,
              dimension.height.xlarge,
              isDefault && justify.center,
              isModal && [justify.start],
              {
                position: 'relative',
              },
            ]}>
            {(showIcon || isModal) && (
              <View
                style={[
                  flex.flexRow,
                  items.center,
                  gap.small,
                  {
                    position: 'absolute',
                    left: 0,
                    top: -size.small,
                  },
                ]}>
                <BackButtonPlaceholder {...props} icon={icon} />
                {isModal && <BackButtonLabel text={title} />}
              </View>
            )}
            {!isModal && <BackButtonLabel text={title} />}
          </View>
        </View>
        {children}
      </View>
    </View>
  );
};
