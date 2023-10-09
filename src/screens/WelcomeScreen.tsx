import {Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';
import {Button} from 'react-native-elements';
import Logo from '../assets/images/bizboost.svg';

import SafeAreaContainer from '../containers/SafeAreaContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
const WelcomeScreen = ({navigation}: Props) => {
  return (
    <SafeAreaContainer>
      <View className="h-full w-full bg-white flex flex-col justify-between items-center">
        <View className="bg-white h-1/2 flex justify-center items-center px-3 py-10">
          <Logo width={200} height={200} />
          <Text className="text-3xl">BizBoost</Text>
        </View>
        <View className="w-full h-1/3 flex justify-center rounded-t-[80px] pb-5">
          <View className="flex flex-row justify-start px-5">
            <Text className="font-bold text-2xl text-white">
              Welcome to BizBoost
            </Text>
          </View>
          <View className="w-full justify-between items-center px-5 py-7">
            <View className="w-full flex flex-col">
              <Button
                title="Sign In"
                buttonStyle={{
                  backgroundColor: '#258842',
                  borderWidth: 2,
                  borderColor: 'white',
                  borderRadius: 10,
                  paddingVertical: 10,
                  marginBottom: 10,
                  width: '100%',
                }}
                onPress={() => {
                  navigation.navigate('Login');
                }}
              />
              <Button
                title="Sign Up"
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#258842',
                  paddingVertical: 10,
                  width: '100%',
                }}
                titleStyle={{color: 'black'}}
                onPress={() => {
                  navigation.navigate('Signup');
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default WelcomeScreen;
