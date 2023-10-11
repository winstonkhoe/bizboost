import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AuthenticatedNavigation from './AuthenticatedNavigation';
import SignUpScreen from '../screens/SignUpScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Authenticated: undefined;
  Chat: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

const GuestNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignUpScreen} />
      <Stack.Screen name="Authenticated" component={AuthenticatedNavigation} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

export default GuestNavigation;
