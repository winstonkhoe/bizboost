import {Alert, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {useState} from 'react';
import {Button} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {User} from '../model/User';
import {useForm, Controller} from 'react-hook-form';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;
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
  } = useForm<FormData>({mode: 'all'});

  const onSubmit = (data: FormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {confirmPassword, ...rest} = data;
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
      <View className="h-full flex justify-between items-center px-4">
        {/* App Bar */}
        <View className="p-4">
          <Text className="text-2xl text-black text-center font-bold">
            Sign Up
          </Text>
        </View>

        {/* Content */}
        <View className="flex flex-col justify-start gap-y-10 mx-5 mt-5 w-full">
          <View className="flex flex-col justify-start">
            <Text className="text-black">Full Name</Text>
            <Controller
              control={control}
              rules={{
                required: true,
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
              <Text className="text-red-500">fullname is required.</Text>
            )}
          </View>
          <View className="flex flex-col justify-start">
            <Text className="text-black">Phone Number</Text>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({field: {onChange, onBlur, value}}) => (
                <TextInput
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  className="w-full border border-x-0 border-t-0 border-b-black px-1"
                />
              )}
              name="phone"
            />
            {errors.phone && (
              <Text className="text-red-500">Phone Number is required.</Text>
            )}
          </View>
          <View className="flex flex-col justify-start">
            <Text className="text-black">Email</Text>
            <Controller
              control={control}
              rules={{
                required: true,
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
              <Text className="text-red-500">Email is required.</Text>
            )}
          </View>

          <View className="flex flex-col justify-start">
            <Text className="text-black">Password</Text>
            <Controller
              control={control}
              rules={{
                required: true,
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
              <Text className="text-red-500">password is required.</Text>
            )}
          </View>

          <View className="flex flex-col justify-start">
            <Text className="text-black">Confirm Password</Text>
            <Controller
              control={control}
              rules={{
                required: true,
                validate: value => value === watch('password'),
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
              <Text className="text-red-500">The passwords do not match</Text>
            )}
          </View>
        </View>

        {/* Login Button */}
        <View className="w-full">
          <Button
            title="SIGN UP"
            buttonStyle={{
              backgroundColor: 'black',
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
              borderWidth: 2,
              borderColor: 'white',
              borderRadius: 30,
              paddingVertical: 20,
            }}
            titleStyle={{fontWeight: 'bold'}}
            onPress={handleSignupWithGoogle}
          />
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default SignUpScreen;
