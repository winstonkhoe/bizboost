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
import {SocialPlatform, User} from '../../../model/User';
import {useNavigation} from '@react-navigation/native';
import {NavigationStackProps} from '../../../navigation/StackNavigation';
import {RegisterSocialPlatform} from '../../signup/RegisterSocialPlatform';

type FormData = {
  biodata: string;
};
const rules = {
  biodata: {
    min: 20,
    max: 500,
  },
};
const EditSocialPlatformScreen = () => {
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
        <RegisterSocialPlatform
          onValidRegistration={v => {}}
          onChangeSocialData={sd => {}}
          // TODO: fix
          initialData={[
            {platform: SocialPlatform.Instagram, data: user?.instagram!},
          ]}
        />
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default EditSocialPlatformScreen;
