import {Pressable, ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useUser} from '../../hooks/user';
import {CustomTextInput} from '../../components/atoms/Input';
import {FormProvider, useForm} from 'react-hook-form';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import PasswordIcon from '../../assets/vectors/password.svg';
import {CustomButton} from '../../components/atoms/Button';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';

type FormData = {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullname: string;
  phone: string;
};
const AboutMeScreen = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const {user, activeData, activeRole, uid} = useUser();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      fullname: activeData?.fullname,
      email: user?.email,
      phone: user?.phone,
    },
  });
  return (
    <PageWithBackButton fullHeight enableSafeAreaContainer>
      <FormProvider {...methods}>
        <View
          style={[
            flex.flexCol,
            padding.horizontal.default,
            {
              paddingTop: Math.max(
                safeAreaInsets.top,
                safeAreaInsets.top < 10 ? size.large : size.xlarge2,
              ),
            },
          ]}
          className="flex-1 justify-between">
          <View style={[flex.flexCol, gap.medium]}>
            <Text className="text-lg font-bold">About Me</Text>

            <CustomTextInput
              label="Name"
              name="fullname"
              rules={{
                required: 'Name is required',
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
              disabled
              rules={{
                required: 'Email is required',
              }}
            />

            <Pressable
              className="flex flex-row items-center justify-between"
              onPress={() => {}}>
              <View className="flex flex-row items-center">
                <PasswordIcon width={18} height={18} fill={'black'} />
                <Text
                  className="font-medium ml-1"
                  style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
                  Password
                </Text>
              </View>
              <Text
                style={[textColor(COLOR.text.green.default), font.size[30]]}>
                Change
              </Text>
            </Pressable>
          </View>

          <CustomButton text="Save" onPress={() => {}} />
        </View>
      </FormProvider>
    </PageWithBackButton>
  );
};

export default AboutMeScreen;
