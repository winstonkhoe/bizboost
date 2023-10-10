import * as React from 'react';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import {Pressable} from 'react-native';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';

const Tab = createBottomTabNavigator();

const AuthenticatedNavigation = () => {
  const dispatch = useAppDispatch();

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{headerShown: false}}>
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
              <Pressable
                className="rounded-full w-6 h-6 bg-yellow-600 overflow-hidden"
                onLongPress={() => {
                  dispatch(openModal());
                }}></Pressable>
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default AuthenticatedNavigation;
