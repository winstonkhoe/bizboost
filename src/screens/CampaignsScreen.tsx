import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {View} from 'react-native';
import {flex} from '../styles/Flex';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {Campaign} from '../model/Campaign';
import {gap} from '../styles/Gap';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {getSimilarCampaigns} from '../validations/campaign';
import {fetchNonUserCampaigns, useOngoingCampaign} from '../hooks/campaign';
import {useCallback, useState} from 'react';
import {useUser} from '../hooks/user';
import {setNonUserCampaigns} from '../redux/slices/campaignSlice';

const CampaignsScreen = () => {
  const {uid} = useUser();
  const dispatch = useAppDispatch();
  const {nonUserCampaigns} = useOngoingCampaign();
  const {searchTerm} = useAppSelector(select => select.search);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    if (uid) {
      setRefreshing(true);
      fetchNonUserCampaigns(uid).then(campaigns => {
        dispatch(setNonUserCampaigns(campaigns));
        setRefreshing(false);
      });
    }
  }, [dispatch, uid]);

  return (
    <PageWithSearchBar>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <VerticalPadding>
          <HorizontalPadding>
            <View style={[flex.flexCol, gap.medium]}>
              {getSimilarCampaigns(nonUserCampaigns, searchTerm).map(
                (c: Campaign, index: number) => (
                  <OngoingCampaignCard campaign={c} key={index} />
                ),
              )}
            </View>
          </HorizontalPadding>
        </VerticalPadding>
      </ScrollView>
    </PageWithSearchBar>
  );
};

export default CampaignsScreen;
