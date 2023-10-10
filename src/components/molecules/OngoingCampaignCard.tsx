import {Image, Pressable, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {borderRadius, radiusSize, rounded} from '../../styles/BorderRadius';
import {shadow} from '../../styles/Shadow';

const OngoingCampaignCard = () => {
  return (
    <View className="bg-transparent" style={[shadow.default, rounded.medium]}>
      <View
        className="relative w-full h-40 overflow-hidden bg-white"
        style={[rounded.medium]}>
        <View
          className="absolute top-0 right-0 px-5 py-1 bg-black overflow-hidden"
          style={[
            borderRadius({
              bottomLeft: radiusSize.medium,
            }),
          ]}>
          <Text className="font-bold text-white text-xs">
            1 Sept 2023 - 31 Sept 2023
          </Text>
        </View>
        <View className="px-4 py-8 w-full h-full" style={flex.flexCol}>
          <View className="w-full" style={[flex.flexRow, gap.default]}>
            <View className="w-24 h-24 rounded-md overflow-hidden">
              <Image
                className="w-full h-full object-cover"
                source={require('../../assets/images/kopi-nako-logo.jpeg')}
              />
            </View>
            <View
              className="flex-1 items-start justify-between"
              style={[flex.flexCol]}>
              <Text className="font-semibold text-base" numberOfLines={2}>
                Kopi Nako BSD City: The New Destination for Coffee Lovers
              </Text>
              <Pressable>
                <View className="rounded-3xl bg-black px-3 py-2">
                  <Text className="font-bold text-white">Detail</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export {OngoingCampaignCard};
