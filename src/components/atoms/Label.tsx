import {Text, View} from 'react-native';

interface Props {
  text: string;
}
const Label = ({text}: Props) => {
  return (
    <View className="px-2 py-1 bg-black rounded-3xl">
      <Text className="font-bold text-white text-xs">{text}</Text>
    </View>
  );
};

export {Label};
