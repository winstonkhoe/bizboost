import React from 'react';
import {Text, View, TextInput, Alert} from 'react-native';
import {Button} from 'react-native-elements'; // You can use a UI library like 'react-native-elements'
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {User} from '../model/User';
import {useForm, Controller} from 'react-hook-form';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

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
      <View className="h-full flex justify-between items-center px-4">
        {/* App Bar */}
        <View className="p-4">
          <Text className="text-2xl text-black text-center font-bold">
            Login
          </Text>
        </View>

        {/* Content */}
        <View className="flex flex-col justify-start gap-y-10 mx-5 mt-5 w-full">
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
              <Text className="text-red-500">Password is required.</Text>
            )}
          </View>
        </View>

        {/* Login Button */}
        <View className="w-full">
          <Button
            title="LOG IN"
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
            onPress={handleLoginWithGoogle}
          />
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default LoginScreen;
