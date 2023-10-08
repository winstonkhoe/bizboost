/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import GuestNavigation from './src/navigation/GuestNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthenticatedNavigation from './src/navigation/AuthenticatedNavigation';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId:
    '403012009031-lbpuvaklnktm5h7ld0o3tt8gv0ni0ahb.apps.googleusercontent.com',
});
const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
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
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          {!user ? <GuestNavigation /> : <AuthenticatedNavigation />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
