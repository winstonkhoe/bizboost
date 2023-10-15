import {Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import {Button} from 'react-native-elements';
import Logo from '../assets/images/bizboost.svg';
import {
  LoginButton,
  AccessToken,
  LoginManager,
  Profile,
  GraphRequest,
  GraphRequestManager,
  FBAccessToken,
} from 'react-native-fbsdk-next';

import SafeAreaContainer from '../containers/SafeAreaContainer';
import {AuthButton} from '../components/atoms/Button';

type Props = NativeStackScreenProps<RootGuestStackParamList, 'Welcome'>;
const WelcomeScreen = ({navigation}: Props) => {
  const loginFb = () => {
    LoginManager.logInWithPermissions([
      'pages_show_list',
      'instagram_basic',
      'business_management',
    ])
      .then(
        function (result) {
          if (result.isCancelled) {
            console.log('Login cancelled');
          } else {
            console.log(result);
            console.log(
              'Login success with permissions: ' +
                result?.grantedPermissions?.toString(),
            );
          }
        },
        function (error) {
          console.log('Login fail with error: ' + error);
        },
      )
      .catch(err => console.log(err));
  };

  const instagramDataCallback = (error?: Object, result?: any) => {
    if (error) {
      console.log('Error fetching data: ' + error.toString());
    } else {
      console.log(result);
    }
  };
  const userInstagramBusinessAccountCallback = (
    error?: Object,
    result?: any,
  ) => {
    if (error) {
      console.log('Error fetching data: ' + error.toString());
    } else {
      const instagramBusinessAccount = result?.instagram_business_account;
      const instagramId = instagramBusinessAccount?.id;
      const infoRequest = new GraphRequest(
        `/${instagramId}`,
        {
          parameters: {
            fields: {
              string:
                'id,followers_count,media_count,username,website,biography',
            },
          },
        },
        instagramDataCallback,
      );
      new GraphRequestManager().addRequest(infoRequest).start();
    }
  };
  const userPagesCallback = (error?: Object, result?: any) => {
    if (error) {
      console.log('Error fetching data: ' + error.toString());
    } else {
      const data = result?.data;
      if (data && data?.length > 0) {
        const page = data?.[0];
        if (page) {
          const page_id = page?.id;
          const infoRequest = new GraphRequest(
            `/${page_id}`,
            {
              parameters: {
                fields: {
                  string: 'instagram_business_account',
                },
              },
            },
            userInstagramBusinessAccountCallback,
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        }
      }
      console.log(result);
    }
  };
  AccessToken.getCurrentAccessToken()
    .then((fbAccessToken: any) => {
      if (fbAccessToken?.accessToken) {
        const infoRequest = new GraphRequest(
          '/me/accounts',
          {},
          userPagesCallback,
        );
        // Start the graph request.
        new GraphRequestManager().addRequest(infoRequest).start();
      }
    })
    .catch(err => console.log('access token error', err));

  // Create a graph request asking for user information with a callback to handle the response.

  return (
    <SafeAreaContainer>
      <View className="h-full w-full bg-white flex flex-col justify-between items-center">
        <View className="bg-white h-1/2 flex justify-center items-center px-3 py-10">
          <Logo width={200} height={200} />
          <Text className="text-3xl">BizBoost</Text>
        </View>
        <View className="w-full h-1/3 flex justify-center rounded-t-[80px] pb-5">
          <View className="flex flex-row justify-start px-5">
            <Text className="font-bold text-2xl text-white">
              Welcome to BizBoost
            </Text>
          </View>
          <View className="w-full justify-between items-center px-5 py-7">
            <View className="w-full flex flex-col">
              <AuthButton
                text="Login with Facebook"
                rounded="default"
                onPress={loginFb}
              />
              <Button
                title="Sign In"
                buttonStyle={{
                  backgroundColor: '#258842',
                  borderWidth: 2,
                  borderColor: 'white',
                  borderRadius: 10,
                  paddingVertical: 10,
                  marginBottom: 10,
                  width: '100%',
                }}
                onPress={() => {
                  navigation.navigate('Login');
                }}
              />
              <Button
                title="Sign Up"
                buttonStyle={{
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#258842',
                  paddingVertical: 10,
                  width: '100%',
                }}
                titleStyle={{color: 'black'}}
                onPress={() => {
                  navigation.navigate('Signup');
                }}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default WelcomeScreen;
