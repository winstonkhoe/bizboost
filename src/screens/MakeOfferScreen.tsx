import React, {useState} from 'react';
import {View, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import {Text} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller, FormProvider} from 'react-hook-form';
import BackNav from '../assets/vectors/chevron-left.svg';
import {COLOR} from '../styles/Color';
import {flex} from '../styles/Flex';
import FieldArray from '../components/organisms/FieldArray';
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
import {Chat, ChatView} from '../model/Chat';
import {User, UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import {useUserChats} from '../hooks/chats';

export type MakeOfferFormData = {
  campaign: string;
  fee: number;
  importantNotes: StringObject[];
};

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.MakeOffer
>;
const MakeOfferScreen = ({route}: Props) => {
  const {contentCreatorId, businessPeopleId} = route.params;
  const navigation = useNavigation<NavigationStackProps>();
  const methods = useForm<MakeOfferFormData>();

  const {uid} = useUser();
  const chatViews = useUserChats().chats;

  const [selectedCampaign, setSelectedCampaign] = useState<Campaign>();

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const onSubmit = (data: MakeOfferFormData) => {
    console.log(data);

    const transaction = new Transaction({
      contentCreatorId: contentCreatorId,
      businessPeopleId: businessPeopleId,
      campaignId: selectedCampaign.id ?? '',
      importantNotes: data.importantNotes.map(getStringObjectValue) ?? [],
      offeredPrice: data.fee ?? 0,
    });

    console.log(transaction);
    transaction.offer().then(isSuccess => {
      if (isSuccess) {
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

        if (matchingChatView) {
          navigation.navigate(AuthenticatedNavigation.ChatDetail, {
            chat: matchingChatView,
          });
        } else {
          const chat = new Chat({
            participants: participants,
          });
          chat.insert().then(success => {
            if (success) {
              chat.convertToChatView(uid).then(cv => {
                navigation.navigate(AuthenticatedNavigation.ChatDetail, {
                  chat: cv,
                });
              });
            }
          });
        }
      } else {
        navigation.goBack();
      }
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
                      }}
                    />
                  </View>

                  <Controller
                    control={methods.control}
                    name="importantNotes"
                    render={({fieldState: {error}}) => (
                      <View>
                        <FieldArray
                          control={methods.control}
                          title="Important Notes"
                          parentName="importantNotes"
                          childName="value"
                          type="optional"
                          placeholder="Add important notes for content creator"
                          helperText={
                            'Ex. "Don\'t use profanity", "Be natural"'
                          }
                        />
                      </View>
                    )}
                  />
                </HorizontalPadding>
              </View>
              <VerticalPadding paddingSize="large">
                <TouchableOpacity
                  className="bg-primary p-3 rounded-md mt-4"
                  onPress={methods.handleSubmit(onSubmit)}>
                  <Text className="text-white text-center">Make Offer</Text>
                </TouchableOpacity>
              </VerticalPadding>
            </View>
          </FormProvider>
        </KeyboardAvoidingContainer>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export default MakeOfferScreen;
