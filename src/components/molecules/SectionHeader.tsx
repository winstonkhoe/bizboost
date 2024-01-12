import {Text, View} from 'react-native';
import {InternalLink} from '../atoms/Link';
import {flex, items, justify} from '../../styles/Flex';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';

interface Props {
  header: string;
  link?: string;
  onPressLink?: () => void;
}

const HomeSectionHeader = ({header, link, onPressLink}: Props) => {
  return (
    <View style={[flex.flexRow, items.center, justify.between]}>
      <Text
        style={[
          font.size[40],
          font.weight.bold,
          textColor(COLOR.text.neutral.high),
        ]}>
        {header}
      </Text>
      {link ? (
        <InternalLink size={30} text={link} onPress={onPressLink} />
      ) : null}
    </View>
  );
};

export {HomeSectionHeader};
