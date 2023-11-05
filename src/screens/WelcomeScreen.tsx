import {Text, View} from 'react-native';
import Logo from '../assets/vectors/content-creator_business-people.svg';

import SafeAreaContainer from '../containers/SafeAreaContainer';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {User, UserAuthProviderData} from '../model/User';
import {useAppDispatch} from '../redux/hooks';
import {
  setSignupProvider,
  updateSignupData,
  updateTemporarySignupData,
} from '../redux/slices/forms/signup';
import {Provider} from '../model/AuthMethod';
import {useNavigation} from '@react-navigation/native';
import {
  GuestNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {AuthProviderButton} from '../components/molecules/AuthProviderButton';

const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();
  const dispatch = useAppDispatch();

  const continueWithGoogle = async () => {
    const data = await User.continueWithGoogle();
    dispatch(
      updateSignupData(
        new User({
          email: data.email,
        }).toJSON(),
      ),
    );
    dispatch(
      updateTemporarySignupData({
        fullname: data.name,
        profilePicture: data.photo,
        token: data.token,
      }),
    );
    dispatch(setSignupProvider(Provider.GOOGLE));
    navigateToSignupPage();
  };

  const continueWithFacebook = () => {
    User.continueWithFacebook((data: UserAuthProviderData) => {
      dispatch(
        updateSignupData(
          new User({
            email: data.email,
            instagram: data.instagram,
          }).toJSON(),
        ),
      );
      dispatch(
        updateTemporarySignupData({
          fullname: data.name,
          profilePicture: data.photo,
          token: data.token,
        }),
      );
      dispatch(setSignupProvider(Provider.FACEBOOK));
      navigateToSignupPage();
    }).catch(err => console.log('err nih', err));
  };

  const handleEmailSignup = () => {
    dispatch(setSignupProvider(Provider.EMAIL));
    navigateToSignupPage();
  };

  const navigateToSignupPage = () => {
    navigation.navigate(GuestNavigation.Signup);
  };

  return (
    <SafeAreaContainer>
      <View className="flex-1 items-center" style={[flex.flexCol]}>
        <View
          className="flex-1 justify-between items-center pt-6 px-3"
          style={[flex.flexCol]}>
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
          <Logo width={280} height={280} />
        </View>
        <View className="w-full flex justify-center rounded-t-[80px] pb-5">
          <View className="w-full justify-between items-center px-5 py-7">
            <View className="w-full" style={[flex.flexCol, gap.default]}>
              <CustomButton
                text="Sign up"
                rounded="max"
                onPress={handleEmailSignup}
              />
              <AuthProviderButton
                provider={Provider.GOOGLE}
                onPress={async () => await continueWithGoogle()}
              />
              <AuthProviderButton
                provider={Provider.FACEBOOK}
                onPress={continueWithFacebook}
              />

              <AuthProviderButton
                provider={Provider.EMAIL}
                type="tertiary"
                onPress={() => {
                  navigation.navigate(GuestNavigation.Login);
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
