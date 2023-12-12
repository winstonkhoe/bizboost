import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import ChatLogoFilled from '../assets/vectors/chat-filled.svg';
import ChatLogoOutline from '../assets/vectors/chat-outline.svg';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';
import {ReactNode, useCallback} from 'react';
import {useUser} from '../hooks/user';
import {UserRole} from '../model/User';
import {Text, View} from 'react-native';
import {COLOR} from '../styles/Color';
import CampaignsScreen from '../screens/CampaignsScreen';
import {NavigationProp} from '@react-navigation/native';
import {closeSearchPage, updateSearchTerm} from '../redux/slices/searchSlice';
import ContentCreatorsScreen from '../screens/ContentCreatorsScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FastImage from 'react-native-fast-image';
import {
  CampaignIcon,
  CooperationIcon,
  DashboardIcon,
  SearchIcon,
} from '../components/atoms/Icon';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import {flex, items, justify} from '../styles/Flex';
import {font} from '../styles/Font';
import {gap} from '../styles/Gap';
import {textColor} from '../styles/Text';
import {dimension} from '../styles/Dimension';
import {rounded} from '../styles/BorderRadius';
import {SizeType, size} from '../styles/Size';

const Tab = createBottomTabNavigator();

export enum TabNavigation {
  Campaigns = 'Campaigns',
  Chat = 'Chat',
  Home = 'Home',
  Dashboard = 'Dashboard',
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

const color = {
  logo: {
    focus: COLOR.green[50],
    default: COLOR.text.neutral.high,
  },
  text: {
    focus: COLOR.green[60],
    default: COLOR.text.neutral.high,
  },
};

const logoSizeType: SizeType = 'large';
const logoSize = size[logoSizeType];

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
      <View style={[dimension.height.xlarge2, flex.flexRow, items.center]}>
        <View
          className="overflow-hidden"
          style={[dimension.square.xlarge, rounded.max]}>
          <FastImage
            source={
              getUserProfile()
                ? {uri: getUserProfile()}
                : require('../assets/images/bizboost-avatar.png')
            }
            style={[dimension.full]}
          />
        </View>
      </View>
    );
  }, [activeRole, user]);

  const homeIcon = useCallback(
    (focused: boolean) => (
      <TabIcon text="Home" isFocused={focused}>
        {focused ? (
          <HomeLogoFilled
            width={logoSize}
            height={logoSize}
            color={color.logo.focus}
          />
        ) : (
          <HomeLogoOutline
            width={logoSize}
            height={logoSize}
            color={color.logo.default}
          />
        )}
      </TabIcon>
    ),
    [],
  );

  // TODO: kayaknya kureng icon campaignnya
  const campaignIcon = useCallback(
    (focused: boolean) => (
      <TabIcon text="Campaign" isFocused={focused}>
        <CampaignIcon
          size={logoSizeType}
          fill={focused ? color.logo.focus : 'transparent'}
          strokeWidth={focused ? 0 : 1.5}
        />
      </TabIcon>
    ),
    [],
  );

  const chatIcon = useCallback(
    (focused: boolean) => (
      <TabIcon text="Chat" isFocused={focused}>
        {focused ? (
          <ChatLogoFilled
            width={logoSize}
            height={logoSize}
            color={color.logo.focus}
          />
        ) : (
          <ChatLogoOutline
            width={logoSize}
            height={logoSize}
            color={color.logo.default}
          />
        )}
      </TabIcon>
    ),
    [],
  );

  const listIcon = useCallback(
    (focused: boolean) => (
      <TabIcon text="Creators" isFocused={focused}>
        <CooperationIcon
          size={logoSizeType}
          color={focused ? color.logo.focus : color.logo.default}
          strokeWidth={focused ? 2 : 1.5}
        />
      </TabIcon>
    ),
    [],
  );

  const searchIcon = useCallback(
    (focused: boolean) => (
      <TabIcon text="Explore" isFocused={focused}>
        <SearchIcon
          width={logoSize}
          height={logoSize}
          color={focused ? color.logo.focus : color.logo.default}
          strokeWidth={focused ? 2 : 1.5}
        />
      </TabIcon>
    ),
    [],
  );

  const dashboardIcon = useCallback(
    (focused: boolean) => (
      <TabIcon text="Dashboard" isFocused={focused}>
        {focused ? (
          <DashboardIcon
            size={logoSizeType}
            color={color.logo.focus}
            strokeWidth={0}
          />
        ) : (
          <DashboardIcon
            size={logoSizeType}
            color={color.logo.default}
            fill="transparent"
            strokeWidth={1.5}
          />
        )}
      </TabIcon>
    ),
    [],
  );

  if (!user || !activeRole) {
    return null;
  }

  return (
    <Tab.Navigator>
      {isContentCreator && (
        <Tab.Group screenOptions={{headerShown: false, tabBarShowLabel: false}}>
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
            name={TabNavigation.Dashboard}
            component={DashboardScreen}
            options={{
              tabBarIcon: ({focused}) => dashboardIcon(focused),
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
        <Tab.Group screenOptions={{headerShown: false, tabBarShowLabel: false}}>
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
            name={TabNavigation.Explore}
            component={ExploreScreen}
            options={{
              tabBarIcon: ({focused}) => searchIcon(focused),
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
        <Tab.Group screenOptions={{headerShown: false, tabBarShowLabel: false}}>
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

interface TabIconProps {
  children?: ReactNode;
  text: string;
  isFocused: boolean;
}

const TabIcon = ({...props}: TabIconProps) => {
  return (
    <View
      style={[
        flex.flexCol,
        items.center,
        justify.center,
        gap.xsmall2,
        dimension.height.xlarge2,
      ]}>
      {props.children}
      <Text
        className={props.isFocused ? 'font-medium' : undefined}
        style={[
          font.size[10],
          textColor(color.text.default),
          props.isFocused && [textColor(color.text.focus)],
        ]}>
        {props.text}
      </Text>
    </View>
  );
};
