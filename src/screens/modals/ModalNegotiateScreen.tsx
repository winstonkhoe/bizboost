import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {StackScreenProps} from '@react-navigation/stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {useNavigation} from '@react-navigation/native';
import {CloseModal} from '../../components/atoms/Close';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {DeviceEventEmitter, Pressable, Text, View} from 'react-native';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../../components/atoms/ViewPadding';
import {CustomButton} from '../../components/atoms/Button';
import {closeModal} from '../../utils/modal';
import {ScrollView} from 'react-native-gesture-handler';
import {KeyboardAvoidingContainer} from '../../containers/KeyboardAvoidingContainer';
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {CustomNumberInput, CustomTextInput} from '../../components/atoms/Input';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {rounded} from '../../styles/BorderRadius';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import {ChevronRight} from '../../components/atoms/Icon';
import {useUser} from '../../hooks/user';
import CampaignPlatformAccordion from '../../components/molecules/CampaignPlatformAccordion';
import {useCallback, useEffect, useState} from 'react';
import {SocialPlatform} from '../../model/User';
import SelectableTag from '../../components/atoms/SelectableTag';
import {Campaign, CampaignPlatform} from '../../model/Campaign';
import {padding} from '../../styles/Padding';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {dimension} from '../../styles/Dimension';
import {overflow} from '../../styles/Overflow';
import {showToast} from '../../helpers/toast';
import {ErrorMessage} from '../../constants/errorMessage';
import {ToastType} from '../../providers/ToastProvider';
import {
  SocialFieldArray,
  TaskFieldArray,
} from '../../components/molecules/TaskFieldArray';
import {LoadingScreen} from '../LoadingScreen';
import {Seperator} from '../../components/atoms/Separator';

export type NegotiateFormData = {
  fee: number;
  notes: string;
  platforms: CampaignPlatform[];
};

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.NegotiateModal
>;

const ModalNegotiateScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {offer} = route.params;
  const latestNegotiation = offer.getLatestNegotiation();
  const methods = useForm<NegotiateFormData>({
    mode: 'onSubmit',
    defaultValues: {
      fee: 150000,
      notes: latestNegotiation?.notes,
      platforms: latestNegotiation?.tasks,
    },
  });
  const {setValue, getValues} = methods;

  const [campaign, setCampaign] = useState<Campaign | null>();
  const {activeRole} = useUser();

  useEffect(() => {
    if (offer.campaignId) {
      Campaign.getById(offer.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
  }, [offer]);

  const onSubmit = (data: NegotiateFormData) => {
    console.log('onsubmit:', data);

    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    offer
      .negotiate(data.fee, data.notes, data.platforms, activeRole)
      .then(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
          return;
        }
        navigation.navigate(AuthenticatedNavigation.Home);
      });
  };

  const onChangeTasks = useCallback(
    (platformTasks: CampaignPlatform[]) => {
      setValue('platforms', platformTasks);
    },
    [setValue],
  );

  if (campaign === undefined) {
    return <LoadingScreen />;
  }

  return (
    <PageWithBackButton
      fullHeight
      icon="close"
      threshold={0}
      backButtonPlaceholder={<BackButtonLabel text="Negotiate Offer" />}>
      <SafeAreaContainer enable>
        <FormProvider {...methods}>
          <ScrollView style={[flex.flex1, flex.flexCol, padding.top.xlarge3]}>
            <KeyboardAvoidingContainer>
              <View style={[flex.flexCol, gap.medium]}>
                <View
                  style={[flex.flexCol, gap.small, padding.horizontal.default]}>
                  <Text
                    style={[
                      textColor(COLOR.text.neutral.high),
                      font.weight.bold,
                      font.size[50],
                    ]}>
                    {'Campaign'}
                  </Text>
                  <Pressable
                    onPress={() => {
                      navigation.navigate(
                        AuthenticatedNavigation.CampaignDetail,
                        {
                          campaignId: offer?.campaignId || '',
                        },
                      );
                    }}
                    style={[flex.flexRow, items.center, gap.default]}>
                    <View
                      style={[
                        rounded.default,
                        dimension.square.xlarge3,
                        overflow.hidden,
                      ]}>
                      <FastImage
                        style={[dimension.full]}
                        source={getSourceOrDefaultAvatar({
                          uri: campaign?.image,
                        })}
                      />
                    </View>
                    <Text
                      style={[
                        flex.flex1,
                        font.weight.semibold,
                        textColor(COLOR.text.neutral.high),
                        font.size[40],
                      ]}>
                      {campaign?.title}
                    </Text>
                    <ChevronRight fill={COLOR.black[20]} size="large" />
                  </Pressable>
                </View>

                <View
                  style={[flex.flexCol, gap.small, padding.horizontal.default]}>
                  <FormFieldHelper title="Your Negotiation" />
                  <CustomTextInput
                    name="fee"
                    inputType="price"
                    rules={{
                      required: 'Fee is required',
                      validate: value => {
                        return (
                          parseInt(value, 10) >= 50000 ||
                          'Minimum fee is Rp50.000'
                        );
                      },
                    }}
                  />
                </View>
                <Seperator />
                <View style={[padding.horizontal.default]}>
                  <TaskFieldArray
                    isInitiallyEditable={false}
                    onChange={onChangeTasks}
                    defaultValue={getValues('platforms')}
                  />
                </View>
                <Seperator />
                <View
                  style={[
                    flex.flexCol,
                    gap.default,
                    padding.horizontal.default,
                  ]}>
                  <FormFieldHelper title="Important Notes" type="optional" />
                  <CustomTextInput
                    placeholder="Things to note for your offer"
                    name="notes"
                    type="textarea"
                    defaultValue={getValues('notes')}
                  />
                </View>
              </View>
            </KeyboardAvoidingContainer>
          </ScrollView>
          <View style={[padding.default]}>
            <CustomButton
              text="Negotiate"
              onPress={methods.handleSubmit(onSubmit)}
            />
          </View>
        </FormProvider>
      </SafeAreaContainer>
    </PageWithBackButton>
  );
};

export default ModalNegotiateScreen;
