import {Text, View} from 'react-native';
import {InternalLink} from '../atoms/Link';
import {flex} from '../../styles/Flex';

interface Props {
  header: string;
  link?: string;
  onPressLink?: () => void;
}

const HomeSectionHeader = ({header, link, onPressLink}: Props) => {
  return (
    <View className="items-center justify-between" style={[flex.flexRow]}>
      <Text className="text-lg font-bold">{header}</Text>
      {link ? <InternalLink text={link} onPress={onPressLink} /> : null}
    </View>
  );
};

export {HomeSectionHeader};
