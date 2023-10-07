import React, {useState} from 'react';
import {Text, View, TextInput} from 'react-native';
import {Button} from 'react-native-elements'; // You can use a UI library like 'react-native-elements'
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({navigation}: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Function to handle email input change
  const handleEmailChange = (text: string) => {
    setEmail(text);
    validateFields(text, password);
  };

  // Function to handle password input change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validateFields(email, text);
  };

  // Function to validate fields
  const validateFields = (emailValue: string, passwordValue: string) => {
    if (emailValue.trim() === '') {
      setEmailError('Email is required');
    } else {
      setEmailError('');
    }

    if (passwordValue.trim() === '') {
      setPasswordError('Password is required');
    } else {
      setPasswordError('');
    }
  };

  // Function to handle the login button press
  const handleLogin = () => {
    // Perform validation
    if (email.trim() === '' || password.trim() === '') {
      return;
    }

    // If validation passes, you can perform the login logic here
    // navigation.navigate('Home');
  };

  return (
    <View className="flex-1 bg-white">
      {/* App Bar */}
      <View className="p-4">
        <Text className="text-2xl text-black text-center font-bold">Login</Text>
      </View>

      {/* Content */}
      <View className="flex flex-col justify-start gap-y-10 mx-5 mt-5">
        <View className="flex flex-col justify-start">
          <Text className="text-black">Email</Text>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={handleEmailChange}
            className="w-full border border-x-0 border-t-0 border-b-black px-1"
          />
          {emailError !== '' && (
            <Text className="text-red-500">{emailError}</Text>
          )}
        </View>

        <View className="flex flex-col justify-start">
          <Text className="text-black">Password</Text>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={true}
            className="w-full border border-x-0 border-t-0 border-b-black px-1"
          />
          {passwordError !== '' && (
            <Text className="text-red-500">{passwordError}</Text>
          )}
        </View>
      </View>

      {/* Login Button */}
      <Button
        title="LOG IN"
        buttonStyle={{
          backgroundColor: 'black',
          borderWidth: 2,
          borderColor: 'white',
          borderRadius: 30,
          paddingVertical: 20,
        }}
        containerStyle={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          marginVertical: 20,
        }}
        titleStyle={{fontWeight: 'bold'}}
        onPress={handleLogin}
        disabled={email.trim() === '' || password.trim() === ''}
      />
    </View>
  );
};

export default LoginScreen;
