import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {TabNavigator} from './TabNavigation';
import CampaignDetailScreen from '../screens/CampaignDetailScreen';
import ChatListScreen from '../screens/ChatListScreen';
import {
  CreateAccountScreen_1,
  CreateAccountScreen_2,
} from '../screens/CreateAccountScreen';
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
import {User} from '../model/User';
import UserDetailScreen from '../screens/UserDetailScreen';

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
  UserDetail = 'User Detail',
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
  [AuthenticatedNavigation.UserDetail]: {userId: string};
};

interface LocationModalProps {
  initialSelectedLocations: Location[];
  eventType: string;
}

interface CategoryModalProps {
  initialSelectedCategories: Category[];
  eventType: string;
}

export type GeneralStack = {
  [GeneralNavigation.LocationModal]: LocationModalProps;
  [GeneralNavigation.CategoryModal]: CategoryModalProps;
};

type CombinedStack = GuestStack & AuthenticatedStack & GeneralStack;

export type NavigationStackProps = NavigationProp<CombinedStack>;

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
const Stack = createStackNavigator<CombinedStack>();
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

const StackNavigator = () => {
  const {user} = useUser();

  return (
    <Stack.Navigator>
      {!user ? (
        <Stack.Group screenOptions={{headerShown: false}}>
          <Stack.Screen
            name={GuestNavigation.Welcome}
            component={WelcomeScreen}
          />
          <Stack.Screen name={GuestNavigation.Login} component={LoginScreen} />
          <Stack.Screen
            name={GuestNavigation.Signup}
            component={SignUpScreen}
          />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen
            name={AuthenticatedNavigation.Main}
            component={TabNavigator}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.ChatList}
            component={ChatListScreen}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.ChatDetail}
            component={ChatScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              cardOverlayEnabled: true,
              ...TransitionPresets.ModalTransition,
            }}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.CampaignDetail}
            component={CampaignDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.BusinessPeopleDetail}
            component={BusinessPeopleDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.UserDetail}
            component={UserDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.CampaignRegistrants}
            component={CampaignRegistrantsScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              cardOverlayEnabled: true,
              ...TransitionPresets.ModalSlideFromBottomIOS,
            }}
          />
          <Stack.Screen
            name={AuthenticatedNavigation.CreateCampaign}
            component={CreateCampaignScreen}
            options={{headerShown: false}}
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
        </Stack.Group>
      )}
      <Stack.Group>
        <Stack.Group
          screenOptions={{
            headerShown: false,
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
  );
};

export default StackNavigator;
