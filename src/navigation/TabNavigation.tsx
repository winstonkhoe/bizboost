import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeLogoOutline from '../assets/vectors/home-outline.svg';
import HomeLogoFilled from '../assets/vectors/home-filled.svg';
import {Image, Pressable} from 'react-native';
import {useAppDispatch} from '../redux/hooks';
import {openModal} from '../redux/slices/modalSlice';
import {useCallback} from 'react';
import {useUser} from '../hooks/user';
import {UserRole} from '../model/User';
import {View} from 'react-native';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
const Tab = createBottomTabNavigator();

const TabNavigation = () => {
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