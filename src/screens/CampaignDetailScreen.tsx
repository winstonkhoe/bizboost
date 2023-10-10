import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {RootAuthenticatedStackParamList} from '../navigation/AuthenticatedNavigation';
import {Text} from 'react-native';
type Props = NativeStackScreenProps<
  RootAuthenticatedStackParamList,
  'CampaignDetail'
>;

const CampaignDetailScreen = ({route}: Props) => {
  const {campaignId} = route.params;
  return <Text>CampaignDetailScreen, Campaign ID: {campaignId}</Text>;
};

export default CampaignDetailScreen;
