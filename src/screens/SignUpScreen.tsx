import {Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {useState} from 'react';
import {Button} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {User} from '../model/User';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;
const SignUpScreen = ({}: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSignup = () => {
    // Perform validation
    // if (email.trim() === '' || password.trim() === '') {
    //   return;
    // }

    // auth()
    //   .createUserWithEmailAndPassword(email, password)
    //   .then(() => {
    //     console.log('User account created & signed in!');
    //   })
    //   .catch(error => {
    //     if (error.code === 'auth/email-already-in-use') {
    //       console.log('That email address is already in use!');
    //     }

    //     if (error.code === 'auth/invalid-email') {
    //       console.log('That email address is invalid!');
    //     }

    //     console.error(error);
    //   });

    User.signUp(email, password);
  };

  const handleSignupWithGoogle = async () => {
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    auth()
      .signInWithCredential(googleCredential)
      .then(() => {
        console.log('Signed with google');
      });
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
            <TextInput
              placeholder="fullname"
              value={fullname}
              onChangeText={text => setFullname(text)}
              className="w-full border border-x-0 border-t-0 border-b-black px-1"
            />
            {emailError !== '' && (
              <Text className="text-red-500">{emailError}</Text>
            )}
          </View>
          <View className="flex flex-col justify-start">
            <Text className="text-black">Phone Number</Text>
            <TextInput
              placeholder="phone"
              value={phone}
              onChangeText={text => setPhone(text)}
              className="w-full border border-x-0 border-t-0 border-b-black px-1"
            />
            {emailError !== '' && (
              <Text className="text-red-500">{emailError}</Text>
            )}
          </View>
          <View className="flex flex-col justify-start">
            <Text className="text-black">Email</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={text => setEmail(text)}
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
              onChangeText={text => setPassword(text)}
              secureTextEntry={true}
              className="w-full border border-x-0 border-t-0 border-b-black px-1"
            />
          </View>

          <View className="flex flex-col justify-start">
            <Text className="text-black">Confirm Password</Text>
            <TextInput
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={text => setConfirmPassword(text)}
              secureTextEntry={true}
              className="w-full border border-x-0 border-t-0 border-b-black px-1"
            />
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
            onPress={handleSignup}
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
