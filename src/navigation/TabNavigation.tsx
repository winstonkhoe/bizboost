import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import {Pressable} from 'react-native';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';
import {useCallback} from 'react';
const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const dispatch = useAppDispatch();

  const profileIcon = useCallback(
    () => (
      <Pressable
        className="rounded-full w-6 h-6 bg-yellow-600 overflow-hidden"
        onLongPress={() => {
          dispatch(openModal());
        }}></Pressable>
    ),
    [dispatch],
  );

  const homeIcon = useCallback(
    (focused: boolean) =>
      focused ? <HomeLogoFilled width={30} /> : <HomeLogoOutline width={30} />,
    [],
  );

  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => homeIcon(focused),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: profileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
