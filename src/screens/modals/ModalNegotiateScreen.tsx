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
import {FormProvider, useForm} from 'react-hook-form';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {CustomNumberInput, CustomTextInput} from '../../components/atoms/Input';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {rounded} from '../../styles/BorderRadius';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import {ChevronRight} from '../../components/atoms/Icon';

export type NegotiateFormData = {
  fee: number;
  importantNotes: string;
};

type Props = StackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.NegotiateModal
>;

const ModalNegotiateScreen = ({route}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {offer, eventType, campaign} = route.params;
  const methods = useForm<NegotiateFormData>();

  const onSubmit = (data: NegotiateFormData) => {
    console.log('onsubmit:', data);

    offer.negotiate(data.fee, data.importantNotes).then(stat => {
      DeviceEventEmitter.emit(eventType, stat);
      closeModal({
        navigation: navigation,
        triggerEventOnClose: 'close.negotiate',
      });
    });
  };

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
