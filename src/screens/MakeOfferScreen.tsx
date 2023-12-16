import React, {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm, FormProvider} from 'react-hook-form';
import {flex} from '../styles/Flex';
import {FormFieldHelper} from '../components/atoms/FormLabel';
import {gap} from '../styles/Gap';
import {CustomTextInput} from '../components/atoms/Input';
import {SelectCampaignOffer} from './offers/SelectCampaignOffer';
import {Campaign} from '../model/Campaign';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {Transaction} from '../model/Transaction';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {Chat, ChatService} from '../model/Chat';
import {UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import {useUserChats} from '../hooks/chats';
import {CustomButton} from '../components/atoms/Button';
import {Offer} from '../model/Offer';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../components/atoms/Header';
import {padding} from '../styles/Padding';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';
import {LoadingScreen} from './LoadingScreen';
import {isValidField} from '../utils/form';

export type MakeOfferFormData = {
  campaign: string;
  fee: number;
  importantNotes: string;
};

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MakeOffer
>;
const MakeOfferScreen = ({route}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {contentCreatorId, businessPeopleId} = route.params;
  const navigation = useNavigation<NavigationStackProps>();
  const methods = useForm<MakeOfferFormData>({
    mode: 'all',
  });

  const {activeRole} = useUser();
  const chatViews = useUserChats().chats;

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

  const onSubmit = (data: MakeOfferFormData) => {
    console.log('onsubmit:', data);

    if (!selectedCampaign?.id) {
      showToast({
        type: ToastType.info,
        message: 'Please select a campaign first',
      });
      return;
    }

    if (!data.fee) {
      showToast({
        type: ToastType.info,
        message: 'Please input your offer fee',
      });
      return;
    }

    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: 'Unknown error has occurred',
      });
      return;
    }

    const transaction = new Transaction({
      contentCreatorId: contentCreatorId,
      businessPeopleId: businessPeopleId,
      campaignId: selectedCampaign.id,
    });

    console.log(transaction);
    setIsLoading(true);
    transaction
      .offer()
      .then(() => {
        const offer = new Offer({
          contentCreatorId: contentCreatorId,
          businessPeopleId: businessPeopleId,
          campaignId: selectedCampaign.id,
          importantNotes: data.importantNotes,
          platformTasks: selectedCampaign.platformTasks,
          offeredPrice: data.fee,
        });

        offer
          .insert()
          .then(() => {
            const participants = [
              {ref: businessPeopleId, role: UserRole.BusinessPeople},
              {ref: contentCreatorId, role: UserRole.ContentCreator},
            ];
            const matchingChatView = chatViews.find(
              ({chat: {participants: chatParticipants = []}}) =>
                chatParticipants.length === participants.length &&
                chatParticipants.every(
                  (participant, index) =>
                    participant.ref === participants[index].ref &&
                    participant.role === participants[index].role,
                ),
            );
            // const matchingChatView = chatViews.find(chatView => {
            //   const chatParticipants = chatView.chat.participants || [];

            //   if (chatParticipants.length !== participants.length) {
            //     return false;
            //   }

            //   return chatParticipants.every((participant, index) => {
            //     return (
            //       participant.ref === participants[index].ref &&
            //       participant.role === participants[index].role
            //     );
            //   });
            // });
            console.log('matchingChatView: ', matchingChatView);

            if (matchingChatView !== undefined && matchingChatView.chat?.id) {
              console.log('ada chat');
              ChatService.insertOfferMessage(
                matchingChatView.chat?.id,
                data.fee.toString(),
                activeRole,
              )
                .then(() => {
                  console.log('send!');
                  navigation.navigate(AuthenticatedNavigation.ChatDetail, {
                    chat: matchingChatView,
                  });
                })
                .catch(() => {
                  showToast({
                    type: ToastType.danger,
                    message: 'Something went wrong',
                  });
                  setIsLoading(false);
                });
            } else {
              const chat = new Chat({
                participants: participants,
              });
              chat
                .insert()
                .then(() => {
                  ChatService.insertOfferMessage(
                    businessPeopleId + contentCreatorId,
                    data.fee.toString(),
                    activeRole,
                  )
                    .then(() => {
                      chat
                        .convertToChatView(activeRole)
                        .then(cv => {
                          navigation.navigate(
                            AuthenticatedNavigation.ChatDetail,
                            {
                              chat: cv,
                            },
                          );
                        })
                        .catch(() => {
                          showToast({
                            type: ToastType.danger,
                            message: 'Something went wrong',
                          });
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    })
                    .catch(() => {
                      showToast({
                        type: ToastType.danger,
                        message: 'Something went wrong',
                      });
                      setIsLoading(false);
                    });
                })
                .catch(() => {
                  showToast({
                    type: ToastType.danger,
                    message: 'Something went wrong',
                  });
                  setIsLoading(false);
                });
            }
          })
          .catch(() => {
            showToast({
              type: ToastType.danger,
              message: 'Something went wrong',
            });
            setIsLoading(false);
          });
      })
      .catch(() => {
        showToast({
          type: ToastType.danger,
          message: 'Something went wrong',
        });
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton
        fullHeight
        threshold={0}
        enableSafeAreaContainer
        backButtonPlaceholder={<BackButtonLabel text="Make Offer" />}>
        <View style={[flex.flex1, flex.flexCol, padding.top.xlarge]}>
          <KeyboardAvoidingContainer>
            <FormProvider {...methods}>
              <View
                style={[
                  flex.flex1,
                  flex.flexCol,
                  gap.xlarge,
                  padding.horizontal.medium,
                  padding.top.large,
                ]}>
                <SelectCampaignOffer
                  onCampaignChange={setSelectedCampaign}
                  contentCreatorToOfferId={contentCreatorId}
                />

                <View style={[flex.flexCol, gap.default]}>
                  <FormFieldHelper title="Offered Fee" titleSize={40} />
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

                <View style={[flex.flexCol, gap.default]}>
                  <FormFieldHelper
                    title="Important Notes"
                    type="optional"
                    titleSize={40}
                  />
                  <CustomTextInput
                    placeholder="Things to note for your offer"
                    name="importantNotes"
                    type="textarea"
                    max={1000}
                    counter
                    description="Maximum 1000 characters"
                  />
                </View>
              </View>
            </FormProvider>
          </KeyboardAvoidingContainer>
          <View style={[padding.horizontal.medium]}>
            <CustomButton
              onPress={methods.handleSubmit(onSubmit)}
              text={'Make Offer'}
              disabled={
                !selectedCampaign ||
                !isValidField(methods.getFieldState('fee', methods.formState))
              }
            />
          </View>
        </View>
      </PageWithBackButton>
    </>
  );
};

export default MakeOfferScreen;
