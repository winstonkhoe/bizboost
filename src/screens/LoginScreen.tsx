import React, {useState} from 'react';
import {Text, View, Alert} from 'react-native';
import {User, UserAuthProviderData} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {CustomButton} from '../components/atoms/Button';
import {flex, justify} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {CustomTextInput} from '../components/atoms/Input';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {Provider} from '../model/AuthMethod';
import {AuthProviderButton} from '../components/molecules/AuthProviderButton';
import {
  setProviderId,
  setSignupProvider,
  updateSignupData,
  updateTemporarySignupData,
} from '../redux/slices/forms/signup';
import {useAppDispatch} from '../redux/hooks';
import {useNavigation} from '@react-navigation/native';
import {
  GuestNavigation,
  GuestStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {LoadingScreen} from './LoadingScreen';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {padding} from '../styles/Padding';
import {font} from '../styles/Font';

type FormData = {
  email: string;
  password: string;
};
type Props = NativeStackScreenProps<GuestStack, GuestNavigation.Login>;
const LoginScreen = ({route}: Props) => {
  const {user = new User({})} = route.params;
  const methods = useForm<FormData>({mode: 'all'});
  const [isLoading, setIsLoading] = useState(false);

  const {handleSubmit} = methods;

  const onSubmit = (data: FormData) => {
    setIsLoading(true);
    User.login(data.email, data.password)
      .catch(error => {
        Alert.alert('Error!', error.message, [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const navigation = useNavigation<NavigationStackProps>();

  const continueWithGoogle = async () => {
    setIsLoading(true);
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
      .catch(err => {
        console.log(err);
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
        console.log('LoginScreen.continueWithFacebook error', err);
        setIsLoading(false);
      });
    } catch (error) {
      console.log('LoginScreen.continueWithFacebook catch', error);
    }
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton enableSafeAreaContainer fullHeight>
        <FormProvider {...methods}>
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              justify.center,
              gap.xlarge2,
              padding.large,
            ]}>
            <Text
              style={[
                textColor(COLOR.text.neutral.high),
                font.size[70],
                font.weight.bold,
              ]}>
              Login
            </Text>

            <View style={[flex.flexCol, gap.small]}>
              <CustomTextInput
                label="Email"
                name="email"
                defaultValue={user.email}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Email address must be a valid address',
                  },
                }}
              />
              <CustomTextInput
                label="Password"
                name="password"
                hideInputText
                rules={{
                  required: 'Password is required',
                }}
              />
            </View>

            <View style={[flex.flexCol, gap.default]}>
              <CustomButton
                text="Log In"
                rounded="max"
                onPress={handleSubmit(onSubmit)}
              />
              <AuthProviderButton
                provider={Provider.GOOGLE}
                onPress={continueWithGoogle}
              />
              <AuthProviderButton
                provider={Provider.FACEBOOK}
                onPress={continueWithFacebook}
              />
            </View>
          </View>
        </FormProvider>
      </PageWithBackButton>
    </>
  );
};

export default LoginScreen;
