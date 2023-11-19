import {ScrollView, Text, View} from 'react-native';
import {CloseModal} from '../../components/atoms/Close';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {useUser} from '../../hooks/user';
import {CustomTextInput} from '../../components/atoms/Input';
import {FormProvider, useForm} from 'react-hook-form';
type FormData = {
  email: string;
  password?: string;
  confirmPassword?: string;
  fullname: string;
  phone: string;
};
const AboutMeScreen = () => {
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
    <SafeAreaContainer enable>
      <CloseModal />
      <ScrollView>
        <FormProvider {...methods}>
          <View style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
            <Text className="text-lg font-bold">About Me</Text>

            <CustomTextInput
              label="Name"
              name="fullname"
              rules={{
                required: 'Name is required',
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
          </View>
        </FormProvider>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default AboutMeScreen;
