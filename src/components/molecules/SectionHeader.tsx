import {Text, View} from 'react-native';
import {InternalLink} from '../atoms/Link';
import {flex} from '../../styles/Flex';

interface Props {
  header: string;
  link?: string;
}

const HomeSectionHeader = ({header, link}: Props) => {
  return (
    <View className="items-center justify-between" style={[flex.flexRow]}>
      <Text className="text-lg font-bold">{header}</Text>
      {link ? <InternalLink text={link} /> : null}
    </View>
  );
};

export {HomeSectionHeader};
