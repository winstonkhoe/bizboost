import {Text, View} from 'react-native';
import {InternalLink} from '../atoms/Link';

interface Props {
  header: string;
  link?: string;
}

const HomeSectionHeader = ({header, link}: Props) => {
  return (
    <View className="w-full flex flex-row items-center justify-between">
      <Text className="text-lg font-bold">{header}</Text>
      {link ? <InternalLink text={link} /> : null}
    </View>
  );
};

export {HomeSectionHeader};
