import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigation from './TabNavigation';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';

export type RootAuthenticatedStackParamList = {
  Main: undefined;
  Home: undefined;
  'Campaign Detail': {campaignId: string};
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
    </Stack.Navigator>
  );
};

export default AuthenticatedNavigation;
