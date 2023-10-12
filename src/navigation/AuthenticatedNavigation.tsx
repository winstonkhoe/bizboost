import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigation from './TabNavigation';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';
import {UserRoles} from '../model/User';
import CreateAccountScreen from '../screens/CreateAccountScreen';

export type RootAuthenticatedStackParamList = {
  Main: undefined;
  Home: undefined;
  'Campaign Detail': {campaignId: string};
  'Create Account': {role: UserRoles};
  // 'Campaign Detail': {campaign: Campaign};
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
      <Stack.Screen
        name="Create Account"
        component={CreateAccountScreen}
        options={{
          headerShown: false,
          presentation: 'containedTransparentModal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthenticatedNavigation;
