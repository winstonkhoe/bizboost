/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {Provider} from 'react-redux';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {store} from './src/redux/store';
import {AuthProvider} from './src/providers/AuthProvider';
import {Settings} from 'react-native-fbsdk-next';

// Ask for consent first if necessary
// Possibly only do this for iOS if no need to handle a GDPR-type flow

GoogleSignin.configure({
  webClientId:
    '403012009031-lbpuvaklnktm5h7ld0o3tt8gv0ni0ahb.apps.googleusercontent.com',
});
const App = () => {
  Settings.initializeSDK();
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <AuthProvider />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default App;
