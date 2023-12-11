import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import CampaignLogoFilled from '../assets/vectors/campaign-filled.svg';
import CampaignLogoOutline from '../assets/vectors/campaign-outline.svg';
import ChatLogoFilled from '../assets/vectors/chat-filled.svg';
import ChatLogoOutline from '../assets/vectors/chat-outline.svg';
import ListLogoFilled from '../assets/vectors/list-box.svg';
import ListLogoOutline from '../assets/vectors/list-box-line.svg';
import SearchLogo from '../assets/vectors/search.svg';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';
import {useCallback} from 'react';
import {useUser} from '../hooks/user';
import {UserRole} from '../model/User';
import {View} from 'react-native';
import {COLOR} from '../styles/Color';
import CampaignsScreen from '../screens/CampaignsScreen';
import {NavigationProp} from '@react-navigation/native';
import {closeSearchPage, updateSearchTerm} from '../redux/slices/searchSlice';
import ContentCreatorsScreen from '../screens/ContentCreatorsScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FastImage from 'react-native-fast-image';

const Tab = createBottomTabNavigator();

export enum TabNavigation {
  Campaigns = 'Campaigns',
  Chat = 'Chat',
  Home = 'Home',
  Profile = 'Profile',
  ContentCreators = 'Content Creators',
  Explore = 'Explore',
}

type TabNavigationParamList = {
  [TabNavigation.Home]: undefined;
  [TabNavigation.Chat]: undefined;
  [TabNavigation.Profile]: undefined;
  [TabNavigation.ContentCreators]: undefined;
  [TabNavigation.Campaigns]: undefined;
  [TabNavigation.Explore]: undefined;
};

export type TabNavigationProps = NavigationProp<TabNavigationParamList>;

export const TabNavigator = () => {
  const dispatch = useAppDispatch();
  const {user, activeRole} = useUser();
  const isContentCreator = activeRole === UserRole.ContentCreator;
  const isBusinessPeople = activeRole === UserRole.BusinessPeople;
  const isAdmin = activeRole === UserRole.Admin;

  const resetSearchState = () => {
    dispatch(updateSearchTerm(''));
    dispatch(closeSearchPage());
  };

  const profileIcon = useCallback(() => {
    const getUserProfile = () => {
      if (activeRole === UserRole.ContentCreator) {
        return user?.contentCreator?.profilePicture;
      } else if (activeRole === UserRole.BusinessPeople) {
        return user?.businessPeople?.profilePicture;
      }
      return undefined;
    };
    return (
      <View className="rounded-full w-6 h-6 overflow-hidden">
        <FastImage
          className="w-full h-full"
          source={
            getUserProfile()
              ? {uri: getUserProfile()}
              : require('../assets/images/bizboost-avatar.png')
          }
        />
      </View>
    );
  }, [activeRole, user]);

  const homeIcon = useCallback(
    (focused: boolean) =>
      focused ? <HomeLogoFilled width={30} /> : <HomeLogoOutline width={30} />,
    [],
  );

  // TODO: kayaknya kureng icon campaignnya
  const campaignIcon = useCallback(
    (focused: boolean) =>
      focused ? (
        <CampaignLogoFilled width={30} fill={'black'} />
      ) : (
        <CampaignLogoOutline width={30} fill={'black'} />
      ),
    [],
  );

  const chatIcon = useCallback(
    (focused: boolean) =>
      focused ? (
        <ChatLogoFilled width={30} height={30} />
      ) : (
        <ChatLogoOutline width={30} height={30} />
      ),
    [],
  );

  const listIcon = useCallback(
    (focused: boolean) =>
      focused ? (
        <ListLogoFilled width={30} height={30} />
      ) : (
        <ListLogoOutline width={30} height={30} />
      ),
    [],
  );

  const searchIcon = useCallback(
    (focused: boolean) =>
      focused ? (
        <SearchLogo width={30} height={30} color={COLOR.green[50]} />
      ) : (
        <SearchLogo width={30} height={30} color={COLOR.green[80]} />
      ),
    [],
  );

  if (!user || !activeRole) {
    return null;
  }

  return (
    <Tab.Navigator>
      {isContentCreator && (
        <Tab.Group screenOptions={{headerShown: false}}>
          <Tab.Screen
            name={TabNavigation.Home}
            component={HomeScreen}
            listeners={{
              tabPress: () => {
                resetSearchState();
              },
            }}
            options={{
              tabBarIcon: ({focused}) => homeIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Chat}
            component={ChatListScreen}
            options={{
              tabBarIcon: ({focused}) => chatIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Campaigns}
            component={CampaignsScreen}
            listeners={{
              tabPress: () => {
                resetSearchState();
              },
            }}
            options={{
              tabBarIcon: ({focused}) => campaignIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Profile}
            component={ProfileScreen}
            listeners={{
              tabLongPress: () => {
                dispatch(openModal());
              },
            }}
            options={{
              tabBarIcon: profileIcon,
            }}
          />
        </Tab.Group>
      )}
      {isBusinessPeople && (
        <Tab.Group screenOptions={{headerShown: false}}>
          <Tab.Screen
            name={TabNavigation.Home}
            component={HomeScreen}
            listeners={{
              tabPress: () => {
                resetSearchState();
              },
            }}
            options={{
              tabBarIcon: ({focused}) => homeIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Chat}
            component={ChatListScreen}
            options={{
              tabBarIcon: ({focused}) => chatIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.ContentCreators}
            component={ContentCreatorsScreen}
            options={{
              tabBarIcon: ({focused}) => listIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Explore}
            component={ExploreScreen}
            options={{
              tabBarIcon: ({focused}) => searchIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Profile}
            component={ProfileScreen}
            listeners={{
              tabLongPress: () => {
                dispatch(openModal());
              },
            }}
            options={{
              tabBarIcon: profileIcon,
            }}
          />
        </Tab.Group>
      )}
      {isAdmin && (
        <Tab.Group screenOptions={{headerShown: false}}>
          <Tab.Screen
            name={TabNavigation.Home}
            component={HomeScreen}
            listeners={{
              tabPress: () => {
                resetSearchState();
              },
            }}
            options={{
              tabBarIcon: ({focused}) => homeIcon(focused),
            }}
          />
          <Tab.Screen
            name={TabNavigation.Profile}
            component={ProfileScreen}
            options={{
              tabBarIcon: profileIcon,
            }}
          />
        </Tab.Group>
      )}
    </Tab.Navigator>
  );
};
