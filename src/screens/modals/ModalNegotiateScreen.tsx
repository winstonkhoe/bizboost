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
import {useState} from 'react';
import {SocialPlatform} from '../../model/User';
import SelectableTag from '../../components/atoms/SelectableTag';
import {CampaignPlatform} from '../../model/Campaign';
import {padding} from '../../styles/Padding';
import {SocialFieldArray} from '../campaign/CreateCampaignScreen';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {dimension} from '../../styles/Dimension';
import {overflow} from '../../styles/Overflow';
import {showToast} from '../../helpers/toast';
import {ErrorMessage} from '../../constants/errorMessage';
import {ToastType} from '../../providers/ToastProvider';

export type NegotiateFormData = {
  fee: number;
  importantNotes: string;
  platforms: CampaignPlatform[];
};

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.NegotiateModal
>;

const ModalNegotiateScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {offer, eventType, campaign} = route.params;
  const methods = useForm<NegotiateFormData>({
    mode: 'all',
    defaultValues: {
      fee: offer.negotiatedPrice ? offer.negotiatedPrice : offer.offeredPrice,
      importantNotes: offer.negotiatedNotes
        ? offer.negotiatedNotes
        : offer.importantNotes,
      platforms: offer.negotiatedTasks
        ? offer.negotiatedTasks
        : campaign.platformTasks,
    },
  });

  const [modify, setModify] = useState(false);

  const {activeRole} = useUser();

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
      .negotiate(data.fee, data.importantNotes, data.platforms, activeRole)
      .then(() => {
        DeviceEventEmitter.emit(eventType, data.fee.toString());
        closeModal({
          navigation: navigation,
          triggerEventOnClose: 'close.negotiate',
        });
      });
  };

  const {control, getValues} = methods;

  const {
    fields: fieldsPlatform,
    append: appendPlatform,
    remove: removePlatform,
  } = useFieldArray({
    name: 'platforms',
    control,
  });

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
              <View
                style={[flex.flexCol, padding.horizontal.default, gap.medium]}>
                <View style={[flex.flexCol, gap.small]}>
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

                <View style={[flex.flexCol, gap.small]}>
                  <FormFieldHelper title="Your Negotiation" />
                  <CustomTextInput
                    name="fee"
                    inputType="price"
                    rules={{
                      required: 'Fee is required',
                      min: 500000,
                    }}
                  />
                </View>

                <View>
                  <View
                    style={flex.flexRow}
                    className="items-center justify-between">
                    <Text
                      className="font-bold pb-2"
                      style={[
                        textColor(COLOR.text.neutral.high),
                        font.size[50],
                      ]}>
                      {'Campaign Task'}
                    </Text>
                    <Pressable onPress={() => setModify(!modify)}>
                      <Text style={textColor(COLOR.green[50])}>
                        {modify ? 'Done' : 'Modify'}
                      </Text>
                    </Pressable>
                  </View>
                  {campaign?.platformTasks && (
                    <View style={flex.flexCol}>
                      {fieldsPlatform.map((fp, index) => (
                        <CampaignPlatformAccordion
                          platform={{
                            name: fp.name,
                            tasks: getValues(`platforms.${index}.tasks`) || [],
                          }}
                          key={index}
                        />
                      ))}
                    </View>
                  )}
                  {modify && (
                    <View style={[flex.flexCol, gap.medium]}>
                      <Controller
                        control={control}
                        name="platforms"
                        rules={{required: 'Platform is required!'}}
                        render={({
                          field: {value: platforms},
                          fieldState: {error},
                        }) => (
                          <View style={[flex.flexCol, gap.default]}>
                            <FormFieldHelper
                              title="Campaign platforms"
                              description="Choose platforms for the campaign tasks."
                            />
                            <View className="flex flex-row gap-2">
                              {Object.values(SocialPlatform).map(
                                (value: SocialPlatform, index) => (
                                  <View key={index}>
                                    <SelectableTag
                                      text={value}
                                      isSelected={
                                        platforms.find(
                                          p => p.name === value,
                                        ) !== undefined
                                      }
                                      onPress={() => {
                                        const searchIndex = platforms.findIndex(
                                          p => p.name === value,
                                        );
                                        if (searchIndex !== -1) {
                                          removePlatform(searchIndex);
                                        } else {
                                          appendPlatform({
                                            name: value,
                                            tasks: [],
                                          });
                                        }
                                      }}
                                    />
                                  </View>
                                ),
                              )}
                            </View>
                            {error && (
                              <Text className="text-xs mt-2 font-medium text-red-500">
                                {/* {`${error}`} */}
                                Platform is required!
                              </Text>
                            )}
                          </View>
                        )}
                      />
                      {fieldsPlatform.map((fp, index) => (
                        <View key={fp.id}>
                          <SocialFieldArray
                            platform={fp.name}
                            control={control}
                            title={`${fp.name}'s Task`}
                            fieldType="textarea"
                            maxFieldLength={150}
                            parentName={`platforms.${index}.tasks`}
                            helperText='Ex. "minimum 30s / story"'
                            placeholder="Add task"
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={[flex.flexCol, gap.default]}>
                  <FormFieldHelper title="Important Notes" type="optional" />
                  <CustomTextInput
                    placeholder="Things to note for your offer"
                    name="importantNotes"
                    type="textarea"
                    defaultValue={offer.importantNotes}
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
