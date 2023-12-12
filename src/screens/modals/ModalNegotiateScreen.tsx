import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {StackScreenProps} from '@react-navigation/stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {useNavigation} from '@react-navigation/native';
import {CloseModal} from '../../components/atoms/Close';
import {flex} from '../../styles/Flex';
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
      fee: offer.offeredPrice,
      importantNotes: offer.importantNotes,
      platforms: campaign.platformTasks,
    },
  });

  const [modify, setModify] = useState(false);

  const {activeRole} = useUser();

  const onSubmit = (data: NegotiateFormData) => {
    console.log('onsubmit:', data);

    offer.negotiate(data.fee, data.importantNotes, activeRole).then(() => {
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
    <SafeAreaContainer enable>
      <FormProvider {...methods}>
        <View className="items-center" style={[flex.flexRow, gap.default]}>
          <CloseModal closeEventType="negotiate" />
          <Text className="text-lg font-bold">Negotiate Offer</Text>
        </View>
        <ScrollView className="flex-1" style={flex.flexCol}>
          <KeyboardAvoidingContainer>
            <VerticalPadding>
              <View style={flex.flexCol} className="flex-1 justify-between">
                <View style={flex.flexCol}>
                  <HorizontalPadding paddingSize="large">
                    <View className="pb-5">
                      <Text
                        className="font-bold pb-2"
                        style={[
                          textColor(COLOR.text.neutral.high),
                          font.size[50],
                        ]}>
                        {'Campaign'}
                      </Text>
                      <Pressable
                        style={flex.flexRow}
                        className="justify-between items-center py-1"
                        onPress={() => {
                          navigation.navigate(
                            AuthenticatedNavigation.CampaignDetail,
                            {
                              campaignId: offer?.campaignId || '',
                            },
                          );
                        }}>
                        <View
                          style={flex.flexRow}
                          className="w-full items-center">
                          <View
                            className="mr-2 w-14 h-14 items-center justify-center overflow-hidden"
                            style={[flex.flexRow, rounded.default]}>
                            <FastImage
                              className="w-full h-full object-cover"
                              source={getSourceOrDefaultAvatar({
                                uri: campaign?.image,
                              })}
                            />
                          </View>
                          <View className="flex-1" style={flex.flexCol}>
                            <Text
                              className="font-bold"
                              style={[
                                textColor(COLOR.text.neutral.high),
                                font.size[40],
                              ]}>
                              {campaign?.title}
                            </Text>
                          </View>
                          <HorizontalPadding paddingSize="small">
                            <ChevronRight fill={COLOR.black[20]} />
                          </HorizontalPadding>
                        </View>
                      </Pressable>
                    </View>

                    <View style={[flex.flexCol, gap.default]}>
                      <FormFieldHelper title="Your Negotiation" />
                      <CustomNumberInput
                        name="fee"
                        type="field"
                        defaultValue={offer.offeredPrice}
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
                          {'Task Summary'}
                        </Text>
                        <Pressable onPress={() => setModify(!modify)}>
                          <Text style={textColor(COLOR.green[50])}>
                            {modify ? 'Done' : 'Modify'}
                          </Text>
                        </Pressable>
                      </View>
                      {!modify && campaign?.platformTasks && (
                        <View style={flex.flexCol}>
                          {fieldsPlatform.map((fp, index) => (
                            <CampaignPlatformAccordion
                              platform={{
                                name: fp.name,
                                tasks:
                                  getValues(`platforms.${index}.tasks`) || [],
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
                                            const searchIndex =
                                              platforms.findIndex(
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

                    <VerticalPadding paddingSize="xlarge">
                      <View style={[flex.flexCol, gap.default]}>
                        <FormFieldHelper
                          title="Important Notes"
                          type="optional"
                        />
                        <CustomTextInput
                          placeholder="Things to note for your offer"
                          name="importantNotes"
                          type="textarea"
                          defaultValue={offer.importantNotes}
                        />
                      </View>
                    </VerticalPadding>
                  </HorizontalPadding>
                </View>
              </View>
            </VerticalPadding>
          </KeyboardAvoidingContainer>
        </ScrollView>
        <HorizontalPadding>
          <VerticalPadding>
            <CustomButton
              text="Negotiate"
              // disabled={selectedCampaign === null}
              onPress={methods.handleSubmit(onSubmit)}
            />
          </VerticalPadding>
        </HorizontalPadding>
      </FormProvider>
    </SafeAreaContainer>
  );
};

export default ModalNegotiateScreen;
