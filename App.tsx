/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import GuestNavigation from './src/navigation/GuestNavigation';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AuthenticatedNavigation from './src/navigation/AuthenticatedNavigation';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {View} from 'react-native';
import {AccountListCard} from './src/components/molecules/AccountListCard';
import {flex} from './src/styles/Flex';
import {gap} from './src/styles/Gap';

GoogleSignin.configure({
  webClientId:
    '403012009031-lbpuvaklnktm5h7ld0o3tt8gv0ni0ahb.apps.googleusercontent.com',
});
const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    bottomSheetModalRef.current?.present();
    // bottomSheetModalRef.current?.expand();
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
        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            enableDynamicSizing
            enablePanDownToClose>
            <BottomSheetView>
              <View className="pt-2 pb-6" style={[flex.flexCol, gap.default]}>
                <AccountListCard name="DavidCoderz" active={true} role="CC" />
                <AccountListCard name="kodetime" active={false} role="BP" />
              </View>
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
