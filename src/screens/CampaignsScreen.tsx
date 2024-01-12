import {RefreshControl, ScrollView} from 'react-native-gesture-handler';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {View} from 'react-native';
import {flex} from '../styles/Flex';
import {CampaignCard} from '../components/molecules/CampaignCard';
import {Campaign} from '../model/Campaign';
import {gap} from '../styles/Gap';
import {
  PageWithSearchBar,
  SearchAutocompletePlaceholder,
} from '../components/templates/PageWithSearchBar';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {getSimilarCampaigns} from '../validations/campaign';
import {fetchNonUserCampaigns, useOngoingCampaign} from '../hooks/campaign';
import {useCallback, useMemo, useState} from 'react';
import {useUser} from '../hooks/user';
import {setNonUserCampaigns} from '../redux/slices/campaignSlice';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {SearchBar} from '../components/organisms/SearchBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import {EmptyPlaceholder} from '../components/templates/EmptyPlaceholder';

const CampaignsScreen = () => {
  const {uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const {nonUserCampaigns} = useOngoingCampaign();
  const {searchTerm} = useAppSelector(select => select.search);
  const [refreshing, setRefreshing] = useState(false);
  const filteredCampaigns = useMemo(
    () => getSimilarCampaigns(nonUserCampaigns, searchTerm),
    [nonUserCampaigns, searchTerm],
  );

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
    <View
      style={[
        flex.flex1,
        background(COLOR.background.neutral.default),
        {
          paddingTop: Math.max(safeAreaInsets.top, size.default),
        },
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[flex.flexCol, padding.horizontal.default]}>
        <View
          style={[
            background(COLOR.background.neutral.default),
            padding.bottom.default,
          ]}>
          <SearchBar />
        </View>
        <SearchAutocompletePlaceholder>
          <View style={[flex.flexCol, gap.medium]}>
            {filteredCampaigns?.length > 0 ? (
              filteredCampaigns.map((c: Campaign, index: number) => (
                <CampaignCard campaign={c} key={index} />
              ))
            ) : (
              <View style={[padding.top.xlarge5]}>
                <EmptyPlaceholder />
              </View>
            )}
          </View>
        </SearchAutocompletePlaceholder>
      </ScrollView>
    </View>
  );
};

export default CampaignsScreen;
