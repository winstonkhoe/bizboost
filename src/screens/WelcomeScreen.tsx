import {Text, View} from 'react-native';
import Logo from '../assets/vectors/content-creator_business-people.svg';

import SafeAreaContainer from '../containers/SafeAreaContainer';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {flex, items, justify, self} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {User, UserAuthProviderData} from '../model/User';
import {Provider} from '../model/AuthMethod';
import {useNavigation} from '@react-navigation/native';
import {
  GuestNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {AuthProviderButton} from '../components/molecules/AuthProviderButton';
import {LoadingScreen} from './LoadingScreen';
import {useState} from 'react';
import {font, text} from '../styles/Font';
import {dimension} from '../styles/Dimension';
import {padding} from '../styles/Padding';

const WelcomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();

  const continueWithGoogle = async () => {
    User.continueWithGoogle()
      .then(data => {
        if (data.token && data.token !== '') {
          navigation.navigate(GuestNavigation.Signup, {
            provider: Provider.GOOGLE,
            providerId: data.id,
            token: data.token,
            name: data.name,
            profilePicture: data.photo,
            user: new User({
              email: data.email,
            }),
          });
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const continueWithFacebook = () => {
    try {
      setIsLoading(true);
      User.continueWithFacebook((data: UserAuthProviderData) => {
        setIsLoading(false);
        navigation.navigate(GuestNavigation.Signup, {
          provider: Provider.FACEBOOK,
          providerId: data.id,
          token: data.token,
          name: data.name,
          profilePicture: data.photo,
          user: new User({
            email: data.email,
            instagram: data.instagram,
          }),
        });
      }).catch(err => {
        console.log('WelcomeScreen.continueWithFacebook error ' + err);
        setIsLoading(false);
      });
    } catch (error) {
      console.log('WelcomeScreen.continueWithFacebook catch ' + error);
      setIsLoading(false);
    }
  };

  const handleEmailSignup = () => {
    navigation.navigate(GuestNavigation.Signup, {
      provider: Provider.EMAIL,
    });
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <SafeAreaContainer enable>
        <View style={[flex.flex1, flex.flexCol]}>
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              items.center,
              justify.around,
              gap.xlarge,
            ]}>
            <View
              style={[flex.flexCol, justify.center, items.center, gap.default]}>
              <Text
                style={[
                  font.size[90],
                  font.weight.heavy,
                  textColor(COLOR.text.neutral.high),
                ]}>
                bizboost
              </Text>
              <Text
                style={[
                  {
                    letterSpacing: -1,
                  },
                  dimension.width.xlarge15,
                  text.center,
                  font.weight.semibold,
                  font.size[40],
                  textColor(COLOR.text.neutral.med),
                ]}>
                a place where content creator and business people meet
              </Text>
            </View>
            <Logo width={280} height={280} />
          </View>
          <View
            style={[
              flex.flexCol,
              gap.default,
              padding.horizontal.default,
              padding.vertical.xlarge,
            ]}>
            <CustomButton
              verticalPadding="default"
              text="Sign up"
              rounded="max"
              onPress={handleEmailSignup}
            />
            <AuthProviderButton
              verticalPadding="default"
              provider={Provider.GOOGLE}
              onPress={async () => await continueWithGoogle()}
            />
            <AuthProviderButton
              verticalPadding="default"
              provider={Provider.FACEBOOK}
              onPress={continueWithFacebook}
            />

            <AuthProviderButton
              verticalPadding="default"
              provider={Provider.EMAIL}
              type="tertiary"
              onPress={() => {
                navigation.navigate(GuestNavigation.Login, {});
              }}
            />
          </View>
        </View>
      </SafeAreaContainer>
    </>
  );
};

export default WelcomeScreen;
