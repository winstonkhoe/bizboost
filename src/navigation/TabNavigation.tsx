import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import ChatLogo from '../assets/vectors/chat.svg';
import {Image, Pressable} from 'react-native';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';
import {useCallback} from 'react';
import {useUser} from '../hooks/user';
import {UserRole} from '../model/User';
import {View} from 'react-native';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import CampaignsScreen from '../screens/CampaignsScreen';
const Tab = createBottomTabNavigator();

export enum TabNavigation {
  Campaigns = 'Campaigns',
  Chat = 'Chat',
  Home = 'Home',
  Profile = 'Profile',
}

export const TabNavigator = () => {
  const dispatch = useAppDispatch();
  const {user, activeRole} = useUser();

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
      <Pressable
        hitSlop={{top: 20, bottom: 50, left: 50, right: 50}}
        className="rounded-full w-6 h-6 overflow-hidden"
        onLongPress={() => {
          dispatch(openModal());
        }}>
        {getUserProfile() ? (
          <Image className="w-full h-full" source={{uri: getUserProfile()}} />
        ) : (
          <View
            className="w-full h-full"
            style={[background(COLOR.black, 0.2)]}></View>
        )}
      </Pressable>
    );
  }, [dispatch, activeRole, user]);

  const homeIcon = useCallback(
    (focused: boolean) =>
      focused ? <HomeLogoFilled width={30} /> : <HomeLogoOutline width={30} />,
    [],
  );

  const chatIcon = useCallback(
    (focused: boolean) =>
      focused ? (
        <ChatLogo width={30} height={30} color={COLOR.black} />
      ) : (
        <ChatLogo width={30} height={30} color={COLOR.black} />
      ),
    [],
  );

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name={TabNavigation.Home}
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => homeIcon(focused),
        }}
      />
      <Tab.Screen
        name={TabNavigation.Chat}
        component={ChatScreen}
        options={{
          tabBarIcon: ({focused}) => chatIcon(focused),
        }}
      />
      <Tab.Screen
        name={TabNavigation.Campaigns}
        component={CampaignsScreen}
      />
      <Tab.Screen
        name={TabNavigation.Profile}
        component={ProfileScreen}
        options={{
          tabBarIcon: profileIcon,
        }}
      />
    </Tab.Navigator>
  );
};
