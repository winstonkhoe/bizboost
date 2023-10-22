import {Alert, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import {User} from '../model/User';
import {useForm, FormProvider} from 'react-hook-form';
import {CustomTextInput} from '../components/atoms/Input';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {CustomButton} from '../components/atoms/Button';

type Props = NativeStackScreenProps<RootGuestStackParamList, 'Signup'>;
type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  fullname: string;
  phone: string;
};
const SignUpScreen = ({}: Props) => {
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {},
  });

  const {handleSubmit, watch} = methods;

  const onSubmit = (data: FormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {confirmPassword, ...rest} = data;
    const signUpData: User = {
      email: rest.email,
      password: rest.password,
      phone: rest.phone,
      businessPeople: {
        fullname: rest.fullname,
      },
    };
    User.signUpBusinessPeople(signUpData).catch(error => {
      Alert.alert('Error!', error.message, [
        {
          text: 'OK',
          onPress: () => console.log('OK Pressed'),
          style: 'cancel',
        },
      ]);
    });
  };

  const handleSignupWithGoogle = () => {
    User.signUpWithGoogle();
  };
  return (
    <PageWithBackButton>
      <FormProvider {...methods}>
        <VerticalPadding paddingSize="large">
          <HorizontalPadding paddingSize="large">
            <View
              className="h-full items-center justify-center"
              style={[flex.flexCol, gap.medium]}>
              {/* App Bar */}
              <Text
                className="text-2xl font-bold"
                style={[textColor(COLOR.text.neutral.high)]}>
                Sign Up
              </Text>

              {/* Content */}
              <View className="w-full" style={[flex.flexCol, gap.small]}>
                <CustomTextInput
                  label="Full name"
                  name="fullname"
                  rules={{
                    required: 'Fullname is required',
                  }}
                />
                <CustomTextInput
                  keyboardType="phone-pad"
                  label="Phone Number"
                  name="phone"
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g,
                      message: 'Phone number is invalid',
                    },
                  }}
                />
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
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  }}
                />

                <CustomTextInput
                  label="Confirm password"
                  name="confirmPassword"
                  hideInputText
                  rules={{
                    required: 'Confirm Password must be filled',
                    validate: value =>
                      value === watch('password') ||
                      'Confirm password must be the same as password',
                  }}
                />
              </View>

              {/* Login Button */}
              <View className="w-full pt-5" style={[flex.flexCol]}>
                <View className="w-full" style={[flex.flexCol, gap.default]}>
                  <CustomButton
                    text="Sign Up"
                    rounded="max"
                    onPress={handleSubmit(onSubmit)}
                  />

                  <CustomButton
                    text="Continue with Google"
                    rounded="max"
                    inverted
                    onPress={handleSignupWithGoogle}
                  />
                </View>
              </View>
            </View>
          </HorizontalPadding>
        </VerticalPadding>
      </FormProvider>
    </PageWithBackButton>
  );
};

export default SignUpScreen;
