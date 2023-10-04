import * as React from 'react';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import {View} from 'react-native';

const Tab = createBottomTabNavigator();

const AuthenticatedNavigation = () => {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) =>
            focused ? (
              <HomeLogoFilled width={30} />
            ) : (
              <HomeLogoOutline width={30} />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => (
            <View className="rounded-full w-6 h-6 bg-yellow-600 overflow-hidden"></View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AuthenticatedNavigation;
