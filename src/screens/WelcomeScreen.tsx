import {Button, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
const WelcomeScreen = ({navigation}: Props) => {
  return (
    <View className="h-full">
      <View className="container h-full justify-center items-center text-center">
        <Text>This is WelcomeScreen</Text>
        <Button
          title="Home"
          onPress={() => {
            navigation.navigate('Login');
          }}
        />
      </View>
    </View>
  );
};

export default WelcomeScreen;
