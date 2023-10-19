import * as React from 'react';

import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

// import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TabNavigation from './TabNavigation';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';
import ChatListScreen from '../screens/ChatListScreen';
import {
  CreateAccountScreen_1,
  CreateAccountScreen_2,
} from '../screens/CreateAccountScreen';
import {NavigationProp} from '@react-navigation/native';
import CreateCampaignScreen from '../screens/CreateCampaignScreen';

export enum AuthenticatedNavigation {
  Main = 'Main',
  Home = 'Home',
  CampaignDetail = 'Campaign Detail',
  CreateAdditionalAccount = 'CreateAdditionalAccount',
  CreateCampaign = 'Create Campaign',
  Chat = 'Chat',
}

export type RootAuthenticatedStackParamList = {
  [AuthenticatedNavigation.Main]: undefined;
  [AuthenticatedNavigation.Home]: undefined;
  [AuthenticatedNavigation.CampaignDetail]: {campaignId: string};
  [AuthenticatedNavigation.CreateAdditionalAccount]: undefined;
  [AuthenticatedNavigation.CreateCampaign]: undefined;

  // 'Campaign Detail': {campaign: Campaign};
  [AuthenticatedNavigation.Chat]: undefined;
};

export type RootAuthenticatedNavigationStackProps =
  NavigationProp<RootAuthenticatedStackParamList>;

export enum CreateAdditionalAccountNavigation {
  First = 'Create Additional Account-1',
  Second = 'Create Additional Account-2',
}

export type CreateAdditionalAccountModalStackParamList = {
  [CreateAdditionalAccountNavigation.First]: undefined;
  [CreateAdditionalAccountNavigation.Second]: undefined;
};

export type CreateAdditionalAccountModalNavigationProps =
  NavigationProp<CreateAdditionalAccountModalStackParamList>;

const CreateAdditionalAccountModalStack =
  createStackNavigator<CreateAdditionalAccountModalStackParamList>();
const Stack = createStackNavigator<RootAuthenticatedStackParamList>();
// const NativeStack =
//   createNativeStackNavigator<RootAuthenticatedNativeStackParamList>();

const CreateAdditionalAccountNavigator = () => {
  return (
    <CreateAdditionalAccountModalStack.Navigator
      initialRouteName={CreateAdditionalAccountNavigation.First}
      screenOptions={{headerShown: false}}>
      <CreateAdditionalAccountModalStack.Screen
        name={CreateAdditionalAccountNavigation.First}
        component={CreateAccountScreen_1}
        options={{
          presentation: 'modal',
          cardOverlayEnabled: true,
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
      <CreateAdditionalAccountModalStack.Group
        screenOptions={{
          presentation: 'card',
        }}>
        <CreateAdditionalAccountModalStack.Screen
          name={CreateAdditionalAccountNavigation.Second}
          component={CreateAccountScreen_2}
        />
      </CreateAdditionalAccountModalStack.Group>
    </CreateAdditionalAccountModalStack.Navigator>
  );
};

const AuthenticatedNavigator = () => {
  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name={AuthenticatedNavigation.Main}
          component={TabNavigation}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={AuthenticatedNavigation.Chat}
          component={ChatListScreen}
        />
        <Stack.Screen
          name={AuthenticatedNavigation.CampaignDetail}
          component={CampaignDetailScreen}
        />
        <Stack.Screen
          name={AuthenticatedNavigation.CreateCampaign}
          component={CreateCampaignScreen}
        />
        <Stack.Screen
          name={AuthenticatedNavigation.CreateAdditionalAccount}
          component={CreateAdditionalAccountNavigator}
          options={{
            headerShown: false,
            presentation: 'modal',
            cardOverlayEnabled: true,
            ...TransitionPresets.ModalSlideFromBottomIOS,
          }}
        />
      </Stack.Navigator>
    </>
  );
};

export default AuthenticatedNavigator;
