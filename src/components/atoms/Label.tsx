import {Text, View} from 'react-native';
import {rounded, RadiusSizeType} from '../../styles/BorderRadius';

interface Props {
  text: string;
  radius?: RadiusSizeType;
}
const Label = ({text, radius = 'xlarge'}: Props) => {
  return (
    <View className="px-2 py-1 bg-black" style={[rounded[radius]]}>
      <Text className="font-bold text-white text-xs">{text}</Text>
    </View>
  );
};

export {Label};
