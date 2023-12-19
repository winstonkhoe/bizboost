import {Pressable, PressableProps, Text, View} from 'react-native';
import {Label} from '../atoms/Label';
import {currencyFormat} from '../../utils/currency';
import {shadow} from '../../styles/Shadow';
import FastImage from 'react-native-fast-image';
import {Offer} from '../../model/Offer';
import {useEffect, useState} from 'react';
import {Campaign} from '../../model/Campaign';
import {User} from '../../model/User';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {getSourceOrDefaultAvatar} from '../../utils/asset';

interface RecentNegotiationCardProps extends PressableProps {
  offer: Offer;
  navigation: NavigationStackProps;
}

const RecentNegotiationCard = ({
  offer,
  navigation,
}: RecentNegotiationCardProps) => {
  const [campaign, setCampaign] = useState<Campaign>();
  const [businessPeople, setBusinessPeople] = useState<User>();

  useEffect(() => {
    if (offer.campaignId) {
      Campaign.getByIdReactive(offer.campaignId, c => setCampaign(c));
    }
    if (offer.businessPeopleId) {
      User.getById(offer.businessPeopleId).then(
        u => u !== null && setBusinessPeople(u),
      );
    }
  }, []);

  return (
    <Pressable
      onPress={() => {
        navigation.navigate(AuthenticatedNavigation.OfferDetail, {
          offerId: offer?.id || '',
        });
      }}
      className="relative w-64 h-40 flex flex-col p-4 my-0.5 rounded-xl bg-white"
      style={[shadow.default]}>
      <View className="w-full flex flex-row">
        <View className="w-16 h-16 rounded-full overflow-hidden">
          <FastImage
            className="w-full h-full object-cover"
            source={getSourceOrDefaultAvatar({
              uri: campaign?.image,
            })}
          />
        </View>
        <View className="flex-1 flex flex-col items-end justify-between">
          <Label text="Offered You" />
          <Text className="font-bold text-base">
            {offer.negotiatedPrice
              ? currencyFormat(offer.negotiatedPrice)
              : currencyFormat(offer.offeredPrice)}
          </Text>
        </View>
      </View>
      <View className="mt-4 w-full flex-1 flex flex-col min-w-0">
        <Text className="font-bold text-xs">
          {businessPeople?.businessPeople?.fullname}
        </Text>
        <Text numberOfLines={2} className="font-medium">
          {campaign?.title}
        </Text>
      </View>
    </Pressable>
  );
};

export {RecentNegotiationCard};
