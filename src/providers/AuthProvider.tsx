import {NavigationContainer} from '@react-navigation/native';
import {SwitchUserModalProvider} from './ModalProvider';
import {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {useAppDispatch} from '../redux/hooks';
import {setUserUid} from '../redux/slices/userSlice';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import StackNavigator from '../navigation/StackNavigation';

export const AuthProvider = () => {
  const [initializing, setInitializing] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
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
    <NavigationContainer>
      <StackNavigator />
      <BottomSheetModalProvider>
        <SwitchUserModalProvider />
      </BottomSheetModalProvider>
    </NavigationContainer>
  );
};
