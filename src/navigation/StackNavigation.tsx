import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {TabNavigator} from './TabNavigation';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';
import ChatListScreen from '../screens/ChatListScreen';
import {CreateAdditionalAccountScreen} from '../screens/CreateAdditionalAccountScreen';
import {NavigationProp} from '@react-navigation/native';
import CreateCampaignScreen from '../screens/CreateCampaignScreen';
import ChatScreen from '../screens/ChatScreen';
import {ChatView} from '../model/Chat';
import CampaignRegistrantsScreen from '../screens/CampaignRegistrantsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ModalLocationScreen from '../screens/modals/ModalLocationScreen';
import {useUser} from '../hooks/user';
import {Location} from '../model/Location';
import {Category} from '../model/Category';
import ModalCategoryScreen from '../screens/modals/ModalCategoryScreen';
import BusinessPeopleDetailScreen from '../screens/BusinessPeopleDetailScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import ContentCreatorDetailScreen from '../screens/ContentCreatorDetailScreen';
import CampaignTimelineScreen from '../screens/CampaignTimeline';
import {useEffect, useState} from 'react';
import SplashScreen from '../screens/SplashScreen';
import MyTransactionsScreen from '../screens/profile/MyTransactionsScreen';
import MyCampaignsScreen from '../screens/profile/MyCampaignsScreen';

export enum GuestNavigation {
  Welcome = 'Welcome',
  Login = 'Login',
  Signup = 'Signup',
  Authenticated = 'Authenticated',
}

export enum AuthenticatedNavigation {
  Main = 'Main',
  Home = 'Home',
  BusinessPeopleDetail = 'Business People Detail',
  CampaignDetail = 'Campaign Detail',
  CreateAdditionalAccount = 'CreateAdditionalAccount',
  CreateCampaign = 'Create Campaign',
  ChatDetail = 'Chat Screen',
  ChatList = 'Chat List',
  CampaignRegistrants = 'Campaign Registrants',
  CampaignTimeline = 'Campaign Timeline',
  UserDetail = 'User Detail',
  ContentCreatorDetail = 'Content Creator Detail',
  MyTransactions = 'My Transactions',
  MyCampaigns = 'My Campaigns',
}

export enum GeneralNavigation {
  LocationModal = 'LocationModal',
  CategoryModal = 'CategoryModal',
}

export type GuestStack = {
  [GuestNavigation.Welcome]: undefined;
  [GuestNavigation.Login]: undefined;
  [GuestNavigation.Signup]: undefined;
  [GuestNavigation.Authenticated]: undefined;
};

export type AuthenticatedStack = {
  [AuthenticatedNavigation.Main]: undefined;
  [AuthenticatedNavigation.Home]: undefined;
  [AuthenticatedNavigation.BusinessPeopleDetail]: {businessPeopleId: string};
  [AuthenticatedNavigation.CampaignDetail]: {campaignId: string};
  [AuthenticatedNavigation.CreateAdditionalAccount]: undefined;
  [AuthenticatedNavigation.CreateCampaign]: undefined;

  [AuthenticatedNavigation.ChatDetail]: {chat: ChatView};
  [AuthenticatedNavigation.ChatList]: undefined;
  [AuthenticatedNavigation.CampaignRegistrants]: {campaignId: string};
  [AuthenticatedNavigation.CampaignTimeline]: {campaignId: string};
  [AuthenticatedNavigation.UserDetail]: {userId: string};
  [AuthenticatedNavigation.ContentCreatorDetail]: {contentCreatorId: string};
  [AuthenticatedNavigation.MyTransactions]: undefined;
  [AuthenticatedNavigation.MyCampaigns]: undefined;
};

interface LocationModalProps {
  initialSelectedLocations: Location[];
  maxSelection?: number;
  eventType: string;
}

interface CategoryModalProps {
  initialSelectedCategories: Category[];
  maxSelection?: number;
  eventType: string;
}

export type GeneralStack = {
  [GeneralNavigation.LocationModal]: LocationModalProps;
  [GeneralNavigation.CategoryModal]: CategoryModalProps;
};

type CombinedStack = GuestStack & AuthenticatedStack & GeneralStack;

export type NavigationStackProps = NavigationProp<CombinedStack>;

const Stack = createStackNavigator<CombinedStack>();

const splashScreenDuration = 1500;
const splashDissolveDuration = 500;

const StackNavigator = () => {
  const {user} = useUser();
  const [showSplash, setShowSplash] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const splashVisibleTimer = setTimeout(() => {
      setSplashVisible(false);
    }, splashScreenDuration);
    return () => {
      clearTimeout(splashVisibleTimer);
    };
  }, []);

  useEffect(() => {
    const showSplashTimer = setTimeout(() => {
      setShowSplash(false);
    }, splashScreenDuration + splashDissolveDuration);
    return () => {
      clearTimeout(showSplashTimer);
    };
  }, []);

  return (
    <>
      {showSplash && (
        <SplashScreen
          visible={splashVisible}
          dissolveDuration={splashDissolveDuration}
        />
      )}
      {!splashVisible && (
        <Stack.Navigator>
          {!user ? (
            <Stack.Group screenOptions={{headerShown: false}}>
              <Stack.Screen
                name={GuestNavigation.Welcome}
                component={WelcomeScreen}
              />
              <Stack.Screen
                name={GuestNavigation.Login}
                component={LoginScreen}
              />
              <Stack.Screen
                name={GuestNavigation.Signup}
                component={SignUpScreen}
              />
            </Stack.Group>
          ) : (
            <Stack.Group
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Group>
                <Stack.Screen
                  name={AuthenticatedNavigation.Main}
                  component={TabNavigator}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.ChatList}
                  component={ChatListScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.CampaignDetail}
                  component={CampaignDetailScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.CampaignTimeline}
                  component={CampaignTimelineScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.BusinessPeopleDetail}
                  component={BusinessPeopleDetailScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.UserDetail}
                  component={UserDetailScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.CreateCampaign}
                  component={CreateCampaignScreen}
                />
              </Stack.Group>

              <Stack.Group
                screenOptions={{
                  presentation: 'modal',
                  cardOverlayEnabled: true,
                  ...TransitionPresets.ModalSlideFromBottomIOS,
                }}>
                <Stack.Screen
                  name={AuthenticatedNavigation.ChatDetail}
                  component={ChatScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.ContentCreatorDetail}
                  component={ContentCreatorDetailScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.CampaignRegistrants}
                  component={CampaignRegistrantsScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.MyTransactions}
                  component={MyTransactionsScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.MyCampaigns}
                  component={MyCampaignsScreen}
                />
                <Stack.Screen
                  name={AuthenticatedNavigation.CreateAdditionalAccount}
                  component={CreateAdditionalAccountScreen}
                />
              </Stack.Group>
            </Stack.Group>
          )}
          <Stack.Group
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
                cardOverlayEnabled: true,
                ...TransitionPresets.ModalSlideFromBottomIOS,
              }}>
              <Stack.Screen
                name={GeneralNavigation.LocationModal}
                component={ModalLocationScreen}
              />
              <Stack.Screen
                name={GeneralNavigation.CategoryModal}
                component={ModalCategoryScreen}
              />
            </Stack.Group>
          </Stack.Group>
        </Stack.Navigator>
      )}
    </>
  );
};

export default StackNavigator;
