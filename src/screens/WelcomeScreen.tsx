import {Button, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
const WelcomeScreen = ({navigation}: Props) => {
  return (
    <SafeAreaContainer>
      <View className="h-full flex justify-between items-center">
        <Text className="text-3xl">BizBoost</Text>
        <View>
          {/* <Pressable
            className="bg-blue-300"
            onPress={() => navigation.navigate('Login')}>
            <Text>Sign In</Text>
          </Pressable> */}
          <Button
            title="Sign In"
            onPress={() => {
              navigation.navigate('Login');
            }}
          />
          <Button
            title="Sign Up"
            onPress={() => {
              navigation.navigate('Signup');
            }}
          />
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default WelcomeScreen;
