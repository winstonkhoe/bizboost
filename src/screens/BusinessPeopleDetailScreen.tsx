import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {useEffect, useState} from 'react';
import {User} from '../model/User';
import {rounded} from '../styles/BorderRadius';
import {flex, items} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {Campaign} from '../model/Campaign';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import FastImage from 'react-native-fast-image';
import {dimension} from '../styles/Dimension';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';

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

  const getProfilePicture = () => {
    if (businessPeople?.businessPeople?.profilePicture) {
      return {uri: businessPeople.businessPeople.profilePicture};
    }
    return require('../assets/images/bizboost-avatar.png');
  };

  return (
    <PageWithBackButton
      enableSafeAreaContainer
      showBackButtonPlaceholderOnThreshold
      backButtonPlaceholder={
        <View style={[flex.flexRow, items.center, gap.default]}>
          <View
            className="overflow-hidden"
            style={[dimension.square.xlarge, rounded.max]}>
            <FastImage style={[dimension.full]} source={getProfilePicture()} />
          </View>
          <Text
            className="font-bold"
            numberOfLines={1}
            style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
            {businessPeople?.businessPeople?.fullname}
          </Text>
        </View>
      }
      threshold={60}>
      <View className="flex flex-col p-4">
        <View className="mb-6" style={[flex.flexRow, gap.large, items.center]}>
          <View className="w-24 h-24 overflow-hidden" style={[rounded.max]}>
            <FastImage className="w-full flex-1" source={getProfilePicture()} />
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
