import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {useEffect, useState} from 'react';
import {User, UserRole} from '../model/User';
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
import {TabView} from '../components/organisms/TabView';
import {ReviewList} from '../components/organisms/ReviewList';
import {Review} from '../model/Review';
import {LoadingScreen} from './LoadingScreen';
import {overflow} from '../styles/Overflow';
import {padding} from '../styles/Padding';
import {ScrollView} from 'react-native-gesture-handler';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.BusinessPeopleDetail
>;
const BusinessPeopleDetailScreen = ({route}: Props) => {
  const {businessPeopleId} = route.params;
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  const [reviews, setReviews] = useState<Review[]>();

  useEffect(() => {
    Campaign.getUserCampaigns(businessPeopleId)
      .then(setCampaigns)
      .catch(() => setCampaigns([]));
    Review.getReviewsByRevieweeId(businessPeopleId, UserRole.BusinessPeople)
      .then(setReviews)
      .catch(() => setReviews([]));
    User.getById(businessPeopleId)
      .then(setBusinessPeople)
      .catch(() => setBusinessPeople(null));
  }, [businessPeopleId]);

  const getProfilePicture = () => {
    if (businessPeople?.businessPeople?.profilePicture) {
      return {uri: businessPeople.businessPeople.profilePicture};
    }
    return require('../assets/images/bizboost-avatar.png');
  };

  if (
    campaigns === undefined ||
    reviews === undefined ||
    businessPeople === undefined
  ) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton
      enableSafeAreaContainer
      showBackButtonPlaceholderOnThreshold
      fullHeight
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
      <View style={[flex.flex1, flex.flexCol, gap.default]}>
        <View
          style={[
            flex.flexRow,
            gap.large,
            items.center,
            padding.top.large,
            padding.horizontal.xlarge,
          ]}>
          <View
            style={[dimension.square.xlarge4, rounded.max, overflow.hidden]}>
            <FastImage style={[dimension.full]} source={getProfilePicture()} />
          </View>
          <View style={[flex.flexCol, gap.xsmall]}>
            <Text
              style={[
                font.size[30],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}
              numberOfLines={1}>
              {businessPeople?.businessPeople?.fullname}
            </Text>
            <Text
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}
              numberOfLines={1}>
              {businessPeople?.phone}
            </Text>
            <Text
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}
              numberOfLines={1}>
              {businessPeople?.email}
            </Text>
          </View>
        </View>
        <TabView labels={['Campaigns', 'Reviews']}>
          <ScrollView
            style={[flex.flex1, padding.horizontal.default]}
            contentContainerStyle={[
              flex.flexCol,
              gap.medium,
              padding.vertical.default,
            ]}>
            {campaigns.map((c, index) => (
              <OngoingCampaignCard campaign={c} key={index} />
            ))}
          </ScrollView>
          <ScrollView
            style={[flex.flex1, padding.default]}
            contentContainerStyle={[flex.flex1]}>
            <ReviewList reviews={reviews} />
          </ScrollView>
        </TabView>
      </View>
    </PageWithBackButton>
  );
};

export default BusinessPeopleDetailScreen;
