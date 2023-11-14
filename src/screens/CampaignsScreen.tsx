import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native-gesture-handler';
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
import {useAppSelector} from '../redux/hooks';
import {getSimilarCampaigns} from '../validations/campaign';

const CampaignsScreen = () => {
  // TODO: validasi, CC gabisa liat campaigns yang punyanya dia sebagai BP
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const {searchTerm} = useAppSelector(select => select.search);
  useEffect(() => {
    Campaign.getAll().then(value => setCampaigns(value));
  }, []);

  return (
    <PageWithSearchBar>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VerticalPadding>
          <HorizontalPadding>
            <View style={[flex.flexCol, gap.medium]}>
              {getSimilarCampaigns(campaigns, searchTerm).map(
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
