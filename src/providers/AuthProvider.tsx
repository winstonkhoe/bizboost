import {NavigationContainer} from '@react-navigation/native';
import GuestNavigation from '../navigation/GuestNavigation';
import AuthenticatedNavigator from '../navigation/AuthenticatedNavigation';
import {SwitchUserModalProvider} from './ModalProvider';
import {useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useAppDispatch} from '../redux/hooks';
import {setUserUid} from '../redux/slices/userSlice';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

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
        {!user ? <GuestNavigation /> : <AuthenticatedNavigator />}
        <BottomSheetModalProvider>
          <SwitchUserModalProvider />
        </BottomSheetModalProvider>
      </NavigationContainer>
    </>
  );
};
