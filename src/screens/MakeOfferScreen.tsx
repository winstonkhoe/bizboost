import React, {useState} from 'react';
import {View, TouchableOpacity, ScrollView} from 'react-native';
import {Text} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {useForm, FormProvider} from 'react-hook-form';
import BackNav from '../assets/vectors/chevron-left.svg';
import {COLOR} from '../styles/Color';
import {flex} from '../styles/Flex';
import {StringObject, getStringObjectValue} from '../utils/stringObject';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {FormFieldHelper} from '../components/atoms/FormLabel';
import {gap} from '../styles/Gap';
import {CustomNumberInput, CustomTextInput} from '../components/atoms/Input';
import {SelectCampaignOffer} from './makeOffer/SelectCampaignOffer';
import {Campaign} from '../model/Campaign';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {Transaction} from '../model/Transaction';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {Chat, ChatService, Message, MessageType} from '../model/Chat';
import {UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import {useUserChats} from '../hooks/chats';
import {CustomButton} from '../components/atoms/Button';
import {Offer} from '../model/Offer';

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
  const {contentCreatorId, businessPeopleId} = route.params;
  const navigation = useNavigation<NavigationStackProps>();
  const methods = useForm<MakeOfferFormData>();

  const {uid, user, activeRole} = useUser();
  const chatViews = useUserChats().chats;

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const onSubmit = (data: MakeOfferFormData) => {
    console.log('onsubmit:', data);

    const transaction = new Transaction({
      contentCreatorId: contentCreatorId,
      businessPeopleId: businessPeopleId,
      campaignId: selectedCampaign.id ?? '',
    });

    console.log(transaction);
    transaction.offer().then(() => {
      const offer = new Offer({
        contentCreatorId: contentCreatorId,
        businessPeopleId: businessPeopleId,
        campaignId: selectedCampaign.id ?? '',
        importantNotes: data.importantNotes ?? '',
        offeredPrice: data.fee ?? 0,
      });

      offer.insert().then(insertion => {
        if (insertion) {
          const participants = [
            {ref: businessPeopleId, role: UserRole.BusinessPeople},
            {ref: contentCreatorId, role: UserRole.ContentCreator},
          ];
          const matchingChatView = chatViews.find(chatView => {
            const chatParticipants = chatView.chat.participants || [];

            if (chatParticipants.length !== participants.length) {
              return false;
            }

            return chatParticipants.every((participant, index) => {
              return (
                participant.ref === participants[index].ref &&
                participant.role === participants[index].role
              );
            });
          });
          console.log('matchingChatView: ', matchingChatView);

          if (matchingChatView !== undefined) {
            console.log('ada chat');
            const newMessage: Message = {
              message: data.fee.toString(),
              role: activeRole!!,
              type: MessageType.Offer,
              createdAt: new Date().getTime(),
            };

            ChatService.insertMessage(
              matchingChatView.chat?.id,
              newMessage,
            ).then(() => {
              console.log('send!');
              navigation.navigate(AuthenticatedNavigation.ChatDetail, {
                chat: matchingChatView,
              });
            });
          } else {
            console.log('ga ada chat');
            const chat = new Chat({
              participants: participants,
            });
            chat.insert().then(success => {
              if (success) {
                console.log('onsubmit chat:', chat);
                chat.convertToChatView(activeRole).then(cv => {
                  console.log('cv:', cv);
                  navigation.navigate(AuthenticatedNavigation.ChatDetail, {
                    chat: cv,
                  });
                });
              }
            });
          }
        }
      });
    });
  };

  return (
    <SafeAreaContainer>
      <ScrollView className="flex-1" style={flex.flexCol}>
        <View className="w-full flex flex-row items-center justify-start px-2 py-4 border-b-[0.5px] border-gray-400">
          <TouchableOpacity onPress={handleBackButtonPress}>
            <BackNav width={30} height={20} color={COLOR.black[100]} />
          </TouchableOpacity>
          <View className="flex flex-col">
            <Text className="text-lg font-bold text-black">Make Offer</Text>
          </View>
        </View>

        <KeyboardAvoidingContainer>
          <FormProvider {...methods}>
            <View style={flex.flexCol} className="flex-1 justify-between">
              <View style={flex.flexCol}>
                <HorizontalPadding paddingSize="large">
                  <SelectCampaignOffer onCampaignChange={setSelectedCampaign} />

                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title="Offered Fee" />
                    <CustomNumberInput
                      name="fee"
                      type="field"
                      rules={{
                        required: 'Fee is required',
                        min: 500000,
                      }}
                    />
                  </View>

                  <View style={[flex.flexCol, gap.default]}>
                    <FormFieldHelper title="Important Notes" type="optional" />
                    <CustomTextInput
                      placeholder="Things to note for your offer"
                      name="importantNotes"
                      type="textarea"
                    />
                  </View>
                </HorizontalPadding>
              </View>
              <VerticalPadding paddingSize="large">
                <CustomButton
                  onPress={methods.handleSubmit(onSubmit)}
                  text={'Make Offer'}
                  disabled={!selectedCampaign}
                />
              </VerticalPadding>
            </View>
          </FormProvider>
        </KeyboardAvoidingContainer>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MakeOfferScreen;
