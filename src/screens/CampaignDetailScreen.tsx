import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {RootAuthenticatedStackParamList} from '../navigation/AuthenticatedNavigation';
import {Text} from 'react-native';
import {View} from 'react-native';
import {Image} from 'react-native';
type Props = NativeStackScreenProps<
  RootAuthenticatedStackParamList,
  'Campaign Detail'
>;

const CampaignDetailScreen = ({route}: Props) => {
  const {campaignId} = route.params;
  return (
    <View>
      <View className="w-full h-60 rounded-md overflow-hidden">
        <Image
          className="w-full h-full object-cover"
          source={require('../assets/images/kopi-nako-logo.jpeg')}
        />
      </View>
      <View className="flex flex-col p-4 gap-2">
        <Text className="font-semibold text-2xl">Campaign Title</Text>
        <View>
          <Text className="font-semibold text-base">Features</Text>
          {[...Array(3)].map((_item: any, index: number) => (
            <Text key={index} className="pl-1">
              • Feature {index}
            </Text>
          ))}
        </View>
        {/* <Text>Tagline</Text> */}
        <View>
          <Text className="font-semibold text-base">Requirements</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {[...Array(13)].map((_item: any, index: number) => (
              <View
                key={index}
                className="border border-red-500 py-1 px-2 rounded-md">
                <Text className="">asdf jkl</Text>
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
          <Text className="font-semibold text-base">Task Summary</Text>
          <Text className="font-semibold">Instagram</Text>
          <Text className="">v 2 Story</Text>
          <Text className="">v 1 Feed</Text>
          <Text className="font-semibold">TikTok</Text>
        </View>
        <Text>CampaignDetailScreen, Campaign ID: {campaignId}</Text>
      </View>
    </View>
  );
};

export default CampaignDetailScreen;
