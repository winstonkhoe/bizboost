import {Image, Text, View} from 'react-native';
import {Label} from '../atoms/Label';
import {currencyFormat} from '../../utils/currency';
import {shadow} from '../../styles/Shadow';

const RecentNegotiationCard = () => {
  return (
    <View
      className="relative w-64 h-40 flex flex-col p-4 my-0.5 rounded-xl bg-white"
      style={[shadow.default]}>
      <View className="w-full flex flex-row">
        <View className="w-16 h-16 rounded-full overflow-hidden">
          <Image
            className="w-full h-full object-cover"
            source={require('../../assets/images/kopi-nako-logo.jpeg')}
          />
        </View>
        <View className="flex-1 flex flex-col items-end justify-between">
          <Label text="Offered You" />
          <Text className="font-bold text-base">
            {currencyFormat(1132500000)}
          </Text>
        </View>
      </View>
      <View className="mt-4 w-full flex-1 flex flex-col min-w-0">
        <Text className="font-bold text-xs">Nako Team</Text>
        <Text numberOfLines={2} className="font-medium">
          Kopi Nako BSD City: The New Destination for Coffee Lovers to hangout
        </Text>
      </View>
    </View>
  );
};

export {RecentNegotiationCard};
