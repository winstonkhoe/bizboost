import {Text} from 'react-native';

interface Props {
  text: string;
}
const InternalLink = ({text}: Props) => {
  return <Text className="text-blue-700 font-semibold text-sm">{text}</Text>;
};

export {InternalLink};
