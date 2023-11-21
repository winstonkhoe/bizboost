import {View} from 'react-native';
import {padding} from '../../styles/Padding';
import {flex, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {ReactNode} from 'react';

interface BottomSheetModalWithTitleProps {
  title: string;
  children?: ReactNode;
}

export const BottomSheetModalWithTitle = ({
  title,
  children,
}: BottomSheetModalWithTitleProps) => {
  return (
    <View style={[padding.large, padding.top.default]}>
      <View style={[flex.flexCol, gap.large, padding.bottom.xlarge]}>
        <View style={[flex.flexRow, justify.center]}>
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
