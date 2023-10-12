import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {RootAuthenticatedStackParamList} from '../navigation/AuthenticatedNavigation';
import {Text} from 'react-native';
import {View} from 'react-native';
import {Image} from 'react-native';
import TagCard from '../components/atoms/TagCard';
import {ScrollView} from 'react-native-gesture-handler';
import {Campaign, CampaignPlatform} from '../model/Campaign';
type Props = NativeStackScreenProps<
  RootAuthenticatedStackParamList,
  'Campaign Detail'
>;

const CampaignDetailScreen = ({route}: Props) => {
  // TODO: pass id instead of object to solve: `Non-serializable values were found in the navigation state.`
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  if (!campaign) {
    return <Text>Loading</Text>;
  }

  return (
    <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
      <View className="w-full h-60 rounded-md overflow-hidden">
        <Image
          className="w-full h-full object-cover"
          source={require('../assets/images/kopi-nako-logo.jpeg')}
        />
      </View>
      <View className="flex flex-col p-4 gap-2">
        <Text className="font-bold text-2xl">{campaign.title}</Text>
        <Text>{campaign.description}</Text>
        <View>
          <Text className="font-semibold text-base">Criteria</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {campaign.criterias.map((_item: any, index: number) => (
              <View key={index}>
                <TagCard text={_item} />
              </View>
            ))}
          </View>
        </View>

        <View>
          <Text className="font-semibold text-base">Important Information</Text>
          {[...Array(3)].map((_item: any, index: number) => (
            <Text key={index} className="pl-1">
              i Info {index}
            </Text>
          ))}
        </View>
        <View>
          <Text className="font-semibold text-base">Fee</Text>
          <Text>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(campaign.fee)}
          </Text>
        </View>
        <View>
          <Text className="font-semibold text-base">Task</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {campaign.platforms.map(
              (_item: CampaignPlatform, index: number) => (
                <View key={index}>
                  <TagCard text={_item.name} />
                  {_item.tasks.map((t, idx) => (
                    <Text key={idx}>{t}</Text>
                  ))}
                </View>
              ),
            )}
          </View>
        </View>
        <View>
          <Text className="font-semibold text-base">Location</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {campaign.locations.map((_item: any, index: number) => (
              <View key={index}>
                <TagCard text={_item} />
              </View>
            ))}
          </View>
        </View>
        <Text>CampaignDetailScreen, Campaign ID: {campaign.id}</Text>
      </View>
    </ScrollView>
  );
};

export default CampaignDetailScreen;
