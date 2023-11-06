import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import ChatLogo from '../assets/vectors/chat.svg';
import {Image} from 'react-native';
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
const Tab = createBottomTabNavigator();

export enum TabNavigation {
  Campaigns = 'Campaigns',
  Chat = 'Chat',
  Home = 'Home',
  Profile = 'Profile',
}

type TabNavigationParamList = {
  [TabNavigation.Home]: undefined;
  [TabNavigation.Chat]: undefined;
  [TabNavigation.Campaigns]: undefined;
  [TabNavigation.Profile]: undefined;
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
        <ChatLogo width={30} height={30} color={COLOR.black[100]} />
      ) : (
        <ChatLogo width={30} height={30} color={COLOR.black[100]} />
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
      {UserRole.Admin !== activeRole && (
        <Tab.Screen
          name={TabNavigation.Chat}
          component={ChatListScreen}
          options={{
            tabBarIcon: ({focused}) => chatIcon(focused),
          }}
        />
      )}
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
