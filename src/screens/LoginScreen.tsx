import React from 'react';
import {Text, View, TextInput, Alert} from 'react-native';
import {Button} from 'react-native-elements';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {User} from '../model/User';
import {useForm, Controller} from 'react-hook-form';

type Props = NativeStackScreenProps<RootGuestStackParamList, 'Login'>;

type FormData = {
  email: string;
  password: string;
};
const LoginScreen = ({}: Props) => {
  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<FormData>({mode: 'all'});

  const onSubmit = (data: FormData) => {
    console.log(data);
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
    <SafeAreaContainer>
      <View className="h-full bg-white flex justify-between items-center px-4 py-36">
        {/* App Bar */}
        <View className="p-4">
          <Text className="text-2xl text-black text-left font-bold">Login</Text>
        </View>

        {/* Content */}
        <View className="flex flex-col justify-start gap-y-10 w-full">
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
        </View>

        <View className="flex flex-col justify-start w-full">
          {/* Login Button */}
          <View className="w-full">
            <Button
              title="LOG IN"
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
              onPress={handleLoginWithGoogle}
            />
          </View>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default LoginScreen;
