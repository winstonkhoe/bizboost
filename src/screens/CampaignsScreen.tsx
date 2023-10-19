import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {ScrollView} from 'react-native-gesture-handler';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {View} from 'react-native';
import {flex} from '../styles/Flex';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {Campaign} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {gap} from '../styles/Gap';

const CampaignsScreen = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  useEffect(() => {
    Campaign.getAll().then(value => setCampaigns(value));
  }, []);

  return (
    <SafeAreaContainer customInsets={{bottom: 0}}>
      <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
        <HorizontalPadding>
          <View style={[flex.flexCol, gap.medium]}>
            {campaigns.map((c: Campaign, index: number) => (
              <OngoingCampaignCard campaign={c} key={index} />
            ))}
          </View>
        </HorizontalPadding>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default CampaignsScreen;
