import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Image, Text, View} from 'react-native';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {useEffect, useState} from 'react';
import {User} from '../model/User';
import {rounded} from '../styles/BorderRadius';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {Campaign} from '../model/Campaign';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.BusinessPeopleDetail
>;
const BusinessPeopleDetailScreen = ({route}: Props) => {
  const {businessPeopleId} = route.params;
  const [businessPeople, setBusinessPeople] = useState<User | undefined>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  useEffect(() => {
    Campaign.getUserCampaigns(businessPeopleId).then(value =>
      setCampaigns(value),
    );
  }, [businessPeopleId]);
  useEffect(() => {
    User.getById(businessPeopleId).then(u => setBusinessPeople(u));
  }, [businessPeopleId]);
  return (
    <PageWithBackButton>
      <View className="flex flex-col p-4">
        <View className="items-center mb-6" style={[flex.flexRow, gap.large]}>
          <View className="w-24 h-24 overflow-hidden" style={[rounded.max]}>
            <Image
              className="w-full flex-1"
              source={
                businessPeople?.businessPeople?.profilePicture
                  ? {uri: businessPeople.businessPeople.profilePicture}
                  : require('../assets/images/bizboost-avatar.png')
              }
            />
          </View>
          <View className="flex-1 items-start" style={[flex.flexCol]}>
            <Text className="text-base font-bold" numberOfLines={1}>
              {businessPeople?.businessPeople?.fullname}
            </Text>
            <Text className="text-xs" numberOfLines={1}>
              {businessPeople?.phone}
            </Text>
            <Text className="text-xs" numberOfLines={1}>
              {businessPeople?.email}
            </Text>
          </View>
        </View>
        <View style={[flex.flexCol, gap.medium]}>
          {campaigns.map((c, index) => (
            <OngoingCampaignCard campaign={c} key={index} />
          ))}
        </View>
      </View>
    </PageWithBackButton>
  );
};

export default BusinessPeopleDetailScreen;
