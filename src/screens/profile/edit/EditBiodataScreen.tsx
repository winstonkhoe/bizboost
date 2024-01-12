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
import {User} from '../../../model/User';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../../navigation/StackNavigation';

type FormData = {
  biodata: string;
};
const rules = {
  biodata: {
    min: 20,
    max: 500,
  },
};
const EditBiodataScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();

  const {user} = useUser();
  const methods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      biodata: user?.contentCreator?.biodata,
    },
  });

  const onSubmit = (d: FormData) => {
    const temp = new User({...user});
    temp.contentCreator = {
      ...temp.contentCreator!,
      biodata: d.biodata,
    };

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
                  Biodata <FormLabel type="required" />
                </Text>
                <Text
                  className="font-medium"
                  style={[textColor(COLOR.text.neutral.med), font.size[20]]}>
                  Tell us about yourself and the content you create. This will
                  be seen by business people when they visit your page.
                </Text>
              </View>
            </View>
            <CustomTextInput
              rules={{
                required: 'Brainstorm must not be empty',
                minLength: rules.biodata.min,
              }}
              counter
              description={`Min. ${rules.biodata.min} characters, Max. ${rules.biodata.max} characters`}
              placeholder="Type your biodata here"
              max={rules.biodata.max}
              name="biodata"
              type="textarea"
            />
          </View>
          <CustomButton
            disabled={methods.formState.errors.biodata !== undefined}
            text="Save"
            onPress={methods.handleSubmit(onSubmit)}
          />
        </View>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default EditBiodataScreen;
