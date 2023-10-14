import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigation from './TabNavigation';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootAuthenticatedStackParamList = {
  Main: undefined;
  Home: undefined;
  'Campaign Detail': {campaignId: string};
  // 'Campaign Detail': {campaign: Campaign};
  Chat: undefined;
};
const Stack = createNativeStackNavigator<RootAuthenticatedStackParamList>();

const AuthenticatedNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={TabNavigation}
        options={{headerShown: false}}
      />
      <Stack.Screen name="Campaign Detail" component={CampaignDetailScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default AuthenticatedNavigation;
