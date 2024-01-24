import {ScrollView, View} from 'react-native';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {Campaign} from '../../model/Campaign';
import {CampaignCard} from '../../components/molecules/CampaignCard';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {size} from '../../styles/Size';
import {useEffect, useState} from 'react';
import {LoadingScreen} from '../LoadingScreen';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MyCampaigns
>;
const MyCampaignsScreen = ({route}: Props) => {
  const {userId} = route.params;
  const [campaigns, setCampaigns] = useState<Campaign[]>();
  const isEmptyCampaign = campaigns?.length === 0;

  useEffect(() => {
    if (userId) {
      return Campaign.getUserCampaignsReactive(userId, (cs: Campaign[]) => {
        const upcomingCampaigns = cs
          .filter(c => c.isUpcomingOrRegistration())
          .sort(Campaign.sortByTimelineStart);
        const pastCampaigns = cs
          .filter(c => !c.isUpcomingOrRegistration())
          .sort(Campaign.sortByTimelineStart)
          .reverse();
        setCampaigns([...upcomingCampaigns, ...pastCampaigns]);
      });
    }
  }, [userId]);

  if (campaigns === undefined) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton
      fullHeight
      backButtonPlaceholder={<BackButtonLabel text="My Campaigns" />}
      threshold={0}>
      <ScrollView
        style={[]}
        contentContainerStyle={[
          !isEmptyCampaign && [
            {
              paddingTop: size.xlarge3,
            },
          ],
          flex.flex1,
        ]}>
        <SafeAreaContainer enable>
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              gap.medium,
              padding.horizontal.default,
            ]}>
            {isEmptyCampaign ? (
              <EmptyPlaceholder />
            ) : (
              campaigns.map((c: Campaign, index: number) => (
                <CampaignCard campaign={c} key={index} />
              ))
            )}
          </View>
        </SafeAreaContainer>
      </ScrollView>
    </PageWithBackButton>
  );
};

export default MyCampaignsScreen;
