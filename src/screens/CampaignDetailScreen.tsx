import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  AuthenticatedNavigation,
  RootAuthenticatedNativeStackParamList,
} from '../navigation/AuthenticatedNavigation';
import {Text} from 'react-native';
import {View} from 'react-native';
import {Image} from 'react-native';
import TagCard from '../components/atoms/TagCard';
import {ScrollView} from 'react-native-gesture-handler';
import {Campaign, CampaignPlatform} from '../model/Campaign';
import {getDate} from '../utils/date';
import {CustomButton} from '../components/atoms/Button';
import {useUser} from '../hooks/user';
import {Transaction} from '../model/Transaction';
type Props = NativeStackScreenProps<
  RootAuthenticatedNativeStackParamList,
  AuthenticatedNavigation.CampaignDetail
>;

const CampaignDetailScreen = ({route}: Props) => {
  const {uid} = useUser();

  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  // TODO: validate join only for CC
  const handleJoinCampaign = () => {
    const data = new Transaction({
      contentCreatorId: uid || '',
      campaignId: campaignId,
      status: 'PENDING',
    });

    data.insert().then(isSuccess => {
      if (isSuccess) {
        console.log('Joined!');
      }
    });
  };

  if (!campaign) {
    return <Text>Loading</Text>;
  }

  return (
    <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
      <View className="w-full h-60 rounded-md overflow-hidden">
        <Image
          className="w-full h-full object-cover"
          source={{uri: campaign.image}}
        />
      </View>
      <View className="flex flex-col p-4 gap-2">
        <Text className="font-bold text-2xl">{campaign.title}</Text>
        <Text className="font-bold text-xs">
          {getDate(campaign.start).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}{' '}
          -{' '}
          {getDate(campaign.end).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <View className="flex flex-row items-center">
          <Text>Available Slot</Text>
          <View className="ml-2 bg-gray-300 py-1 px-2 rounded-md min-w-12">
            <Text className="text-center text-xs font-bold">
              0/{campaign.slot}
            </Text>
          </View>
        </View>
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
          {campaign.importantInformation.map((_item: any, index: number) => (
            <Text key={index} className="pl-1 mb-1">
              ℹ️ {_item}
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
          <View className="flex flex-col flex-wrap gap-2">
            {campaign.platforms.map(
              (_item: CampaignPlatform, index: number) => (
                <View key={index}>
                  <Text className="font-semibold">{_item.name}</Text>
                  {_item.tasks.map((t, idx) => (
                    <Text key={idx}>✓ {t}</Text>
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
        <View className="py-4">
          {/* TODO: validate join only for CC */}
          <CustomButton
            text="Join Campaign"
            rounded="default"
            onPress={handleJoinCampaign}
          />
        </View>
        {/* <Text>CampaignDetailScreen, Campaign ID: {campaign.id}</Text> */}
      </View>
    </ScrollView>
  );
};

export default CampaignDetailScreen;
