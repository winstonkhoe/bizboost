import {Pressable, ScrollView, Text, View} from 'react-native';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {CloseModal} from '../../components/atoms/Close';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {FormProvider, useForm} from 'react-hook-form';
import {useUser} from '../../hooks/user';
import {CustomTextInput} from '../../components/atoms/Input';
import {CustomButton} from '../../components/atoms/Button';

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
const ChangePasswordScreen = () => {
  // TODO: validate only if auth method is email password
  const {user, activeData} = useUser();
  const methods = useForm<FormData>({
    mode: 'all',
  });
  return (
    <SafeAreaContainer enable>
      <CloseModal />

      <FormProvider {...methods}>
        <View
          style={[flex.flexCol, padding.horizontal.default]}
          className="flex-1 justify-between">
          <View style={[flex.flexCol, gap.medium]}>
            <Text className="text-lg font-bold">Change Password</Text>
            <CustomTextInput
              label="Old Password"
              name="oldPassword"
              hideInputText
              rules={{
                required: 'Old password is required',
              }}
            />

            <CustomTextInput
              label="New Password"
              name="newPassword"
              hideInputText
              rules={{
                required: 'New password is required',
              }}
            />

            <CustomTextInput
              label="Confirm Password"
              name="confirmPassword"
              hideInputText
              rules={{
                required: 'Confirm Password must be filled',
                validate: value =>
                  value === methods.watch('newPassword') ||
                  'Confirm password must be the same as password',
              }}
            />
          </View>

          <CustomButton text="Change" onPress={() => {}} />
        </View>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default ChangePasswordScreen;
