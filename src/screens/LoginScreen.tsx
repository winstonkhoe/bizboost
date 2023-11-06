import React from 'react';
import {Text, View, Alert} from 'react-native';
import {User, UserAuthProviderData} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {CustomButton} from '../components/atoms/Button';
import {flex} from '../styles/Flex';
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
  NavigationStackProps,
} from '../navigation/StackNavigation';

type FormData = {
  email: string;
  password: string;
};
const LoginScreen = () => {
  const methods = useForm<FormData>({mode: 'all'});

  const {handleSubmit} = methods;

  const onSubmit = (data: FormData) => {
    User.login(data.email, data.password).catch(error => {
      Alert.alert('Error!', error.message, [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
          style: 'cancel',
        },
      ]);
    });
  };

  const navigation = useNavigation<NavigationStackProps>();
  const dispatch = useAppDispatch();

  const continueWithGoogle = async () => {
    const data = await User.continueWithGoogle();
    if (data.token && data.token !== '') {
      console.log(data);
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
      dispatch(setProviderId(data.id));
      dispatch(setSignupProvider(Provider.GOOGLE));
      navigateToSignupPage();
    }
  };

  const continueWithFacebook = () => {
    try {
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
        dispatch(setProviderId(data.id));
        dispatch(setSignupProvider(Provider.FACEBOOK));
        navigateToSignupPage();
      }).catch(err => console.log('err nih', err));
    } catch (error) {
      console.log('trycatch fb', error);
    }
  };

  const navigateToSignupPage = () => {
    navigation.navigate(GuestNavigation.Signup);
  };

  return (
    <PageWithBackButton>
      <View className="h-full">
        <FormProvider {...methods}>
          <VerticalPadding paddingSize="large">
            <HorizontalPadding paddingSize="large">
              <View
                className="h-full items-center justify-center"
                style={[flex.flexCol, gap.medium]}>
                {/* App Bar */}
                <View className="p-4">
                  <Text
                    className="text-2xl font-bold"
                    style={[textColor(COLOR.text.neutral.high)]}>
                    Login
                  </Text>
                </View>

                {/* Content */}
                <View className="w-full" style={[flex.flexCol, gap.small]}>
                  <CustomTextInput
                    label="Email"
                    name="email"
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

                <View className="w-full pt-5" style={[flex.flexCol]}>
                  {/* Login Button */}
                  <View className="w-full" style={[flex.flexCol, gap.default]}>
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
              </View>
            </HorizontalPadding>
          </VerticalPadding>
        </FormProvider>
      </View>
    </PageWithBackButton>
  );
};

export default LoginScreen;
