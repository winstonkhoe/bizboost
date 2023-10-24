import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import ChatLogoFilled from '../assets/vectors/chat-filled.svg';
import ChatLogoOutline from '../assets/vectors/chat-outline.svg';
import ListLogoFilled from '../assets/vectors/list-box.svg';
import ListLogoOutline from '../assets/vectors/list-box-line.svg';
import {Image} from 'react-native';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';
import {useCallback} from 'react';
import {useUser} from '../hooks/user';
import {UserRole} from '../model/User';
import {View} from 'react-native';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import CampaignsScreen from '../screens/CampaignsScreen';
import {NavigationProp} from '@react-navigation/native';
import {closeSearchPage, updateSearchTerm} from '../redux/slices/searchSlice';
import ContentCreatorsScreen from '../screens/ContentCreatorsScreen';
const Tab = createBottomTabNavigator();

export enum TabNavigation {
  Campaigns = 'Campaigns',
  Chat = 'Chat',
  Home = 'Home',
  Profile = 'Profile',
  ContentCreators = 'Content Creators',
}

type TabNavigationParamList = {
  [TabNavigation.Home]: undefined;
  [TabNavigation.Chat]: undefined;
  [TabNavigation.Campaigns]: undefined;
  [TabNavigation.Profile]: undefined;
  [TabNavigation.ContentCreators]: undefined;
};

export type TabNavigationProps = NavigationProp<TabNavigationParamList>;

export const TabNavigator = () => {
  const dispatch = useAppDispatch();
  const {user, activeRole} = useUser();

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
        <Image
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

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
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
      {UserRole.ContentCreator === activeRole && (
        <Tab.Screen
          name={TabNavigation.Campaigns}
          component={CampaignsScreen}
          listeners={{
            tabPress: () => {
              resetSearchState();
            },
          }}
        />
      )}
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
    </Tab.Navigator>
  );
};
