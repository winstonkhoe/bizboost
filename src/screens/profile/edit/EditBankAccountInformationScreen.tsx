import {View} from 'react-native';
import {CloseModal} from '../../../components/atoms/Close';
import SafeAreaContainer from '../../../containers/SafeAreaContainer';
import {flex, items} from '../../../styles/Flex';
import {gap} from '../../../styles/Gap';
import {padding} from '../../../styles/Padding';
import {Text} from 'react-native';
import {textColor} from '../../../styles/Text';
import {COLOR} from '../../../styles/Color';
import {FormLabel} from '../../../components/atoms/FormLabel';
import {
  CustomNumberInput,
  CustomTextInput,
} from '../../../components/atoms/Input';
import {font} from '../../../styles/Font';
import {FormProvider, useForm} from 'react-hook-form';
import {useUser} from '../../../hooks/user';
import {CustomButton} from '../../../components/atoms/Button';
import {BankAccountInformation, User} from '../../../model/User';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../../navigation/StackNavigation';

const EditBankAccountInformationScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();

  const {user} = useUser();
  const methods = useForm<BankAccountInformation>({
    mode: 'all',
    defaultValues: {
      bankName: user?.bankAccountInformation?.bankName,
      accountHolderName: user?.bankAccountInformation?.accountHolderName,
      accountNumber: user?.bankAccountInformation?.accountNumber,
    },
  });

  const onSubmit = (b: BankAccountInformation) => {
    const temp = new User({...user});
    temp.bankAccountInformation = b;

    temp.updateUserData().then(() => {
      navigation.goBack();
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
            <View style={[flex.flexRow, items.center]}>
              <View style={[flex.flexCol, flex.growShrink, gap.small]}>
                <Text
                  className="font-bold"
                  style={[textColor(COLOR.text.neutral.high), font.size[40]]}>
                  Bank Account Information <FormLabel type="required" />
                </Text>
                <Text
                  className="font-medium"
                  style={[textColor(COLOR.text.neutral.med), font.size[20]]}>
                  Input your bank account number for payment and withdrawal
                  purposes
                </Text>
              </View>
            </View>
            <CustomTextInput
              label="Bank Name"
              name="bankName"
              placeholder="Bank Name (e.g: BCA, BRI, Jago)"
              rules={{
                required: 'Bank Name cannot be empty',
              }}
            />
            <CustomTextInput
              label="Account Holder Name"
              name="accountHolderName"
              placeholder="Account Holder Name (e.g: John Doe)"
              rules={{
                required: 'Account Holder Name cannot be empty',
              }}
            />
            <CustomTextInput
              label="Account Number"
              name="accountNumber"
              placeholder="Account Number"
              rules={{
                required: 'Account Number cannot be empty',
                pattern: {
                  value: /^[0-9]{9,18}$/,
                  message: 'Account Number is invalid',
                },
              }}
            />
          </View>
          <CustomButton text="Save" onPress={methods.handleSubmit(onSubmit)} />
        </View>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default EditBankAccountInformationScreen;
