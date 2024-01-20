import {ScrollView} from 'react-native-gesture-handler';
import {View} from 'react-native';
import {flex} from '../styles/Flex';
import {CampaignCard} from '../components/molecules/CampaignCard';
import {Campaign} from '../model/Campaign';
import {gap} from '../styles/Gap';
import {SearchAutocompletePlaceholder} from '../components/templates/PageWithSearchBar';
import {useAppSelector} from '../redux/hooks';
import {getSimilarCampaigns} from '../validations/campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {useMemo} from 'react';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {SearchBar} from '../components/organisms/SearchBar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import {EmptyPlaceholder} from '../components/templates/EmptyPlaceholder';

const CampaignsScreen = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const {nonUserCampaigns} = useOngoingCampaign();
  const {searchTerm} = useAppSelector(select => select.search);
  const filteredCampaigns = useMemo(
    () => getSimilarCampaigns(nonUserCampaigns, searchTerm),
    [nonUserCampaigns, searchTerm],
  );

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
