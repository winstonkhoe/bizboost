import {Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
const LoginScreen = ({}: Props) => {
  return (
    <View className="h-full">
      <View className="container h-full justify-center items-center text-center">
        <Text>This is LoginScreen</Text>
      </View>
    </View>
  );
};

export default LoginScreen;
