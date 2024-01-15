import {View} from 'react-native';
import {CloseModal} from '../../../components/atoms/Close';
import SafeAreaContainer from '../../../containers/SafeAreaContainer';
import {flex, items, justify} from '../../../styles/Flex';
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
import {
  PlatformData,
  RegisterSocialPlatform,
} from '../../signup/RegisterSocialPlatform';
import {useMemo, useState} from 'react';

const EditSocialPlatformScreen = () => {
  const navigation = useNavigation<NavigationStackProps>();
  const [isValidPlatformData, setIsValidPlatformData] = useState(false);
  const {user} = useUser();

  const [platformDatas, setPlatformDatas] = useState<PlatformData[]>();
  const initialPlatformDatas = useMemo(() => {
    const datas = [];
    if (user?.instagram?.username) {
      datas.push({
        platform: SocialPlatform.Instagram,
        data: user?.instagram,
      });
    }
    if (user?.tiktok?.username) {
      datas.push({
        platform: SocialPlatform.Tiktok,
        data: user?.tiktok,
      });
    }
    return datas;
  }, [user?.instagram, user?.tiktok]);
  const onSubmit = () => {
    const temp = new User({...user});
    temp
      .update({
        tiktok: {
          isSynchronized: temp.tiktok?.isSynchronized,
          // platformDatas below might be undefined when user tries to 'delete' their social media, which won't update the firestore. The isSynchronized assigning above is the workaround for it
          ...platformDatas?.find(
            platform => platform.platform === SocialPlatform.Tiktok,
          )?.data,
        },
        instagram: {
          isSynchronized: temp.instagram?.isSynchronized,
          ...platformDatas?.find(
            platform => platform.platform === SocialPlatform.Instagram,
          )?.data,
        },
      })
      .then(() => {
        navigation.goBack();
      });
  };
  return (
    <SafeAreaContainer enable>
      <CloseModal />
      <View
        style={[flex.flexCol, padding.horizontal.default, justify.between]}
        className="flex-1">
        <RegisterSocialPlatform
          onValidRegistration={setIsValidPlatformData}
          onChangeSocialData={setPlatformDatas}
          initialData={initialPlatformDatas}
        />
        <CustomButton
          text="Save"
          onPress={onSubmit}
          disabled={!isValidPlatformData}
        />
      </View>
    </SafeAreaContainer>
  );
};

export default EditSocialPlatformScreen;
