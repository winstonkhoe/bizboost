import React from 'react';
import {Text, View, Alert} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import {User} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {CustomButton} from '../components/atoms/Button';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {CustomTextInput} from '../components/atoms/Input';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';

type Props = NativeStackScreenProps<RootGuestStackParamList, 'Login'>;

type FormData = {
  email: string;
  password: string;
};
const LoginScreen = ({}: Props) => {
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

  const handleLoginWithGoogle = () => {
    User.loginWithGoogle();
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
                    <CustomButton
                      text="Continue With Google"
                      rounded="max"
                      inverted
                      onPress={handleLoginWithGoogle}
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
