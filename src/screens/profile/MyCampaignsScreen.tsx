import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
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
import {useOngoingCampaign} from '../../hooks/campaign';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MyCampaigns
>;
const MyCampaignsScreen = ({route}: Props) => {
  const {userCampaigns} = useOngoingCampaign();
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <PageWithBackButton
      fullHeight
      backButtonPlaceholder={<BackButtonLabel text="My Campaigns" />}
      threshold={0}>
      <ScrollView
        style={[
          {
            paddingTop: Math.max(safeAreaInsets.top, size.default),
          },
        ]}
        contentContainerStyle={[flex.flex1]}>
        <SafeAreaContainer enable>
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              gap.medium,
              padding.horizontal.default,
            ]}>
            {userCampaigns.length <= 0 ? (
              <EmptyPlaceholder />
            ) : (
              userCampaigns.map((c: Campaign, index: number) => (
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
