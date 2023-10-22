import {ReactNode, useEffect, useState} from 'react';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {SearchBar} from '../organisms/SearchBar';
import {Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import {ScrollView} from 'react-native-gesture-handler';
import {AutoCompleteSearchItem} from '../molecules/AutoCompleteSearchItem';
import {gap} from '../../styles/Gap';
import {useAppSelector} from '../../redux/hooks';
import {Campaign} from '../../model/Campaign';
import {getSimilarCampaigns} from '../../validations/campaign';

interface Props {
  children: ReactNode;
}

export const PageWithSearchBar = ({children}: Props) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const {isOnSearchPage, searchTerm} = useAppSelector(state => state.search);
  useEffect(() => {
    Campaign.getAll().then(campaignsData => setCampaigns(campaignsData));
  }, []);
  return (
    <SafeAreaContainer>
      <View className="h-full text-center" style={[flex.flexCol]}>
        <HorizontalPadding>
          <SearchBar />
        </HorizontalPadding>
        <View className="mb-3" />
        {isOnSearchPage ? (
          <View className="h-full w-full" style={[flex.flexCol]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[flex.flexCol, gap.default]}>
                {searchTerm !== '' &&
                  getSimilarCampaigns(campaigns, searchTerm).map(
                    (campaign: Campaign) =>
                      campaign.title && (
                        <HorizontalPadding key={campaign.id}>
                          <AutoCompleteSearchItem itemValue={campaign.title} />
                        </HorizontalPadding>
                      ),
                  )}
              </View>
            </ScrollView>
          </View>
        ) : (
          children
        )}
      </View>
    </SafeAreaContainer>
  );
};
