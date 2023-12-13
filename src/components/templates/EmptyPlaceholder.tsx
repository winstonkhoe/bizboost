import {Text} from 'react-native';
import {View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {font} from '../../styles/Font';
import EmptyIllustration from '../../assets/vectors/empty-illustration.svg';
import {dimension} from '../../styles/Dimension';
import {padding} from '../../styles/Padding';
import {ReactNode} from 'react';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';

interface EmptyPlaceholderProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export const EmptyPlaceholder = ({
  title = 'Nothing here yet',
  description = 'As soon as there are updates, you’ll see them here.',
  children,
}: EmptyPlaceholderProps) => {
  return (
    <View
      style={[
        flex.flex1,
        flex.flexCol,
        padding.horizontal.xlarge2,
        gap.xlarge,
        items.center,
        justify.center,
      ]}>
      <EmptyIllustration style={[dimension.square.xlarge10]} />
      <View style={[flex.flexCol, gap.small]}>
        <Text
          className="text-center font-bold"
          style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
          {title}
        </Text>
        <Text
          className="text-center"
          style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
};
