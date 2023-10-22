import {Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootGuestStackParamList} from '../navigation/GuestNavigation';
import Logo from '../assets/vectors/content-creator_business-people.svg';
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
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';

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
      <View className="h-full w-full bg-green-100/10 flex flex-col items-center">
        <View className="flex-1 flex flex-col justify-between items-center pt-10 px-3">
          <View className="flex flex-col items-center px-5">
            <Text
              className="font-extrabold text-5xl"
              style={[textColor(COLOR.text.neutral.high)]}>
              bizboost
            </Text>
            <Text
              className="font-semibold text-lg text-center tracking-tighter"
              style={[textColor(COLOR.text.neutral.med)]}>
              a place where content creator and business people meet
            </Text>
          </View>
          <Logo width={400} height={400} />
        </View>
        <View className="w-full flex justify-center rounded-t-[80px] pb-5">
          <View className="w-full justify-between items-center px-5 py-7">
            <View className="w-full" style={[flex.flexCol, gap.default]}>
              <CustomButton
                text="Login with Facebook"
                rounded="max"
                onPress={loginFb}
              />
              <CustomButton
                text="Sign In"
                rounded="max"
                onPress={() => {
                  navigation.navigate('Login');
                }}
              />
              <CustomButton
                text="Sign Up"
                inverted
                rounded="max"
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
