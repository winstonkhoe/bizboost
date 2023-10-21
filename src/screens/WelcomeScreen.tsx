import {Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import Logo from '../assets/vectors/content-creator_business-people.svg';

import SafeAreaContainer from '../containers/SafeAreaContainer';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';

type Props = NativeStackScreenProps<RootGuestStackParamList, 'Welcome'>;
const WelcomeScreen = ({navigation}: Props) => {
  return (
    <SafeAreaContainer>
      <View className="h-full w-full bg-green-100/10 flex flex-col items-center">
        <View className="flex-1 flex flex-col justify-between items-center pt-10 px-3">
          <View className="flex flex-col items-center px-5">
            <Text
              className="font-extrabold text-5xl"
              style={[textColor(COLOR.text.neutral.high)]}>
              bizboost
            </Text>
            <Text
              className="font-semibold text-lg text-center tracking-tighter"
              style={[textColor(COLOR.text.neutral.med)]}>
              a place where content creator and business people meet
            </Text>
          </View>
          <Logo width={400} height={400} />
        </View>
        <View className="w-full flex justify-center rounded-t-[80px] pb-5">
          <View className="w-full justify-between items-center px-5 py-7">
            <View className="w-full" style={[flex.flexCol, gap.default]}>
              <CustomButton
                text="Sign In"
                rounded="max"
                onPress={() => {
                  navigation.navigate('Login');
                }}
              />
              <CustomButton
                text="Sign Up"
                inverted
                rounded="max"
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
