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
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import {User} from '../../model/User';

type FormData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};
const ChangePasswordScreen = () => {
  // TODO: validate only if auth method is email password
  const {user, activeData} = useUser();
  const navigation = useNavigation<NavigationStackProps>();

  const methods = useForm<FormData>({
    mode: 'all',
  });

  const onSubmitButtonClicked = (data: FormData) => {
    console.log(typeof user);
    console.log(user instanceof User);
    // TODO: temporary solve (@win ini kenapa ya si user dari useUser typenya ga dianggep User, jadi gw mau akses method non-staticnya ga bisa)

    const temp = new User({...user});
    temp
      .updatePassword(data.oldPassword, data.newPassword)
      .then(() => {
        console.log('Update password success!');
        navigation.goBack();
      })
      .catch(error => {
        // TODO: show alert / toast if error
        console.log(error.message);
      });
  };
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

          <CustomButton
            text="Change"
            onPress={methods.handleSubmit(onSubmitButtonClicked)}
          />
        </View>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default ChangePasswordScreen;
