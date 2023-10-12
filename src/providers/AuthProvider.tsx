import {NavigationContainer} from '@react-navigation/native';
import GuestNavigation from '../navigation/GuestNavigation';
import AuthenticatedNavigation from '../navigation/AuthenticatedNavigation';
import {SwitchUserModalProvider} from './ModalProvider';
import {useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useAppDispatch} from '../redux/hooks';
import {setUserUid} from '../redux/slices/userSlice';

export const AuthProvider = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
      dispatch(setUserUid(userState?.uid));
      if (initializing) {
        setInitializing(false);
      }
    });
    return subscriber;
  });
  if (initializing) {
    return null;
  }
  return (
    <>
      <NavigationContainer>
        {!user ? <GuestNavigation /> : <AuthenticatedNavigation />}
        <SwitchUserModalProvider />
      </NavigationContainer>
    </>
  );
};
