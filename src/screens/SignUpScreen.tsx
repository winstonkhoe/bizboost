import {Alert, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {Button} from 'react-native-elements';
import {User} from '../model/User';
import {useForm, Controller} from 'react-hook-form';

type Props = NativeStackScreenProps<RootGuestStackParamList, 'Signup'>;
type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  fullname: string;
  phone: string;
  profilePicture: string;
  role: 'CC' | 'BP' | 'Admin';
};
const SignUpScreen = ({}: Props) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      profilePicture: 'a',
      role: 'CC',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('data' + data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {confirmPassword, ...rest} = data;

    console.log(rest);
    User.signUp(rest).catch(error => {
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
    <SafeAreaContainer>
      <View className="h-full bg-white flex justify-between items-center px-4 py-10">
        {/* App Bar */}
        <View>
          <Text className="text-2xl text-black text-center font-bold">
            Sign Up
          </Text>
        </View>

        {/* Content */}
        <View className="flex flex-col justify-start gap-y-10 w-full">
          <View className="flex flex-col justify-start">
            <Text className="text-black">Full Name</Text>
            <Controller
              control={control}
              rules={{
                required: 'Fullname is required',
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  className="w-full border border-x-0 border-t-0 border-b-black px-1"
                />
              )}
              name="fullname"
            />
            {errors.fullname && (
              <Text className="text-red-500">{errors.fullname.message}</Text>
            )}
          </View>
          <View className="flex flex-col justify-start">
            <Text className="text-black">Phone Number</Text>
            <Controller
              control={control}
              rules={{
                required: 'Phone number is required',
                pattern: {
                  value: /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/g,
                  message: 'Phone number is invalid',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  keyboardType="phone-pad"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  className="w-full border border-x-0 border-t-0 border-b-black px-1"
                />
              )}
              name="phone"
            />
            {errors.phone && (
              <Text className="text-red-500">{errors.phone.message}</Text>
            )}
          </View>
          <View className="flex flex-col justify-start">
            <Text className="text-black">Email</Text>
            <Controller
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Email address must be a valid address',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  className="w-full border border-x-0 border-t-0 border-b-black px-1"
                />
              )}
              name="email"
            />
            {errors.email && (
              <Text className="text-red-500">{errors.email.message}</Text>
            )}
          </View>

          <View className="flex flex-col justify-start">
            <Text className="text-black">Password</Text>
            <Controller
              control={control}
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={true}
                  className="w-full border border-x-0 border-t-0 border-b-black px-1"
                />
              )}
              name="password"
            />
            {errors.password && (
              <Text className="text-red-500">{errors.password.message}</Text>
            )}
          </View>

          <View className="flex flex-col justify-start">
            <Text className="text-black">Confirm Password</Text>
            <Controller
              control={control}
              rules={{
                required: 'Confirm Password must be filled',
                validate: value =>
                  value === watch('password') ||
                  'Confirm password must be the same as password',
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  secureTextEntry={true}
                  className="w-full border border-x-0 border-t-0 border-b-black px-1"
                />
              )}
              name="confirmPassword"
            />
            {errors.confirmPassword && (
              <Text className="text-red-500">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>
        </View>

        {/* Login Button */}
        <View className="w-full">
          <Button
            title="SIGN UP"
            buttonStyle={{
              backgroundColor: '#258842',
              borderWidth: 2,
              borderColor: 'white',
              borderRadius: 30,
              paddingVertical: 20,
              width: '100%',
            }}
            titleStyle={{fontWeight: 'bold'}}
            onPress={handleSubmit(onSubmit)}
          />

          <Button
            title="CONTINUE WITH GOOGLE"
            buttonStyle={{
              backgroundColor: 'transparent',
              borderWidth: 2,
              borderColor: '#258842',
              borderRadius: 30,
              paddingVertical: 20,
            }}
            titleStyle={{fontWeight: 'bold', color: 'black'}}
            onPress={handleSignupWithGoogle}
          />
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default SignUpScreen;
