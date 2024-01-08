import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useEffect, useState} from 'react';
import {Campaign} from '../../model/Campaign';
import {useUser} from '../../hooks/user';
import {OngoingCampaignCard} from '../../components/molecules/OngoingCampaignCard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MyCampaigns
>;
const MyCampaignsScreen = ({route}: Props) => {
  const {userId} = route.params;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  // const {uid} = useUser();

  useEffect(() => {
    if (userId) {
      const unsubscribe = Campaign.getUserCampaignsReactive(userId, c => {
        setCampaigns(c);
      });

      return unsubscribe;
    }
  }, [userId]);
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
          <Text className="text-lg font-bold">Campaigns</Text>
          {campaigns.length <= 0 ? (
            <Text>No campaigns yet!</Text>
          ) : (
            campaigns.map((c: Campaign, index: number) => (
              <OngoingCampaignCard campaign={c} key={index} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MyCampaignsScreen;
