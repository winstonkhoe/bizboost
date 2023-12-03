import {NavigationContainer} from '@react-navigation/native';
import {SwitchUserModalProvider} from './ModalProvider';
import {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import {useAppDispatch} from '../redux/hooks';
import {setUserUid} from '../redux/slices/userSlice';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import StackNavigator from '../navigation/StackNavigation';
import ToastProvider from './ToastProvider';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Providers = () => {
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
    <SafeAreaProvider>
      <ToastProvider />
      <NavigationContainer>
        <BottomSheetModalProvider>
          <StackNavigator />
          <SwitchUserModalProvider />
        </BottomSheetModalProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default Providers;
