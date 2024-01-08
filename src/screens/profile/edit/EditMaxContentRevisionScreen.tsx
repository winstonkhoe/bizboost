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
import {CustomNumberInput} from '../../../components/atoms/Input';
import {font} from '../../../styles/Font';
import {FormProvider, useForm} from 'react-hook-form';
import {useUser} from '../../../hooks/user';
import {CustomButton} from '../../../components/atoms/Button';
import {User} from '../../../model/User';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../../navigation/StackNavigation';
import {showToast} from '../../../helpers/toast';
import {ToastType} from '../../../providers/ToastProvider';

type FormData = {
  contentRevisionLimit: number;
};

const EditMaxContentRevisionScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();

  const {user} = useUser();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      contentRevisionLimit: user?.contentCreator?.contentRevisionLimit,
    },
  });

  const onSubmit = (d: FormData) => {
    const temp = new User({...user});
    temp
      .update({
        'contentCreator.contentRevisionLimit': d.contentRevisionLimit,
      })
      .then(() => {
        showToast({
          type: ToastType.success,
          message: 'Successfully updated content revision limit',
        });
        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
        navigation.navigate(AuthenticatedNavigation.Home);
      })
      .catch(() => {
        showToast({
          type: ToastType.danger,
          message: 'Failed to update content revision limit',
        });
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
                  Content Revision <FormLabel type="required" />
                </Text>
                <Text
                  className="font-medium"
                  style={[textColor(COLOR.text.neutral.med), font.size[20]]}>
                  Max revision to limit business people revision request
                </Text>
              </View>
            </View>
            <CustomNumberInput
              name="contentRevisionLimit"
              type="field"
              min={0}
              max={999}
              rules={{
                required: 'Revision limit cannot be empty',
              }}
            />
          </View>
          <CustomButton text="Save" onPress={methods.handleSubmit(onSubmit)} />
        </View>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default EditMaxContentRevisionScreen;
