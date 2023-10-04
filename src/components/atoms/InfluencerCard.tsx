import {Image, ImageSourcePropType, Text, View} from 'react-native';

interface Props {
  index: number;
  image: ImageSourcePropType;
}
const InfluencerCard = ({index, image}: Props) => {
  return (
    <View
      key={index}
      className="basis-[44] h-52 my-2 flex flex-col border border-black rounded-xl overflow-hidden">
      <Image source={image} className="h-3/4 w-full" />
      <View className="h-full p-2">
        <Text className="font-bold">Content Creator {index + 1}</Text>
        <Text className="text-xs">Food</Text>
      </View>
    </View>
  );
};

export default InfluencerCard;
