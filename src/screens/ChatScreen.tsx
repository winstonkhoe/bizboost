import React, {useState, useRef, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';
import SafeAreaContainer from '../containers/SafeAreaContainer';

import {useUser} from '../hooks/user';
import {flex} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {gap} from '../styles/Gap';
import {Chat, Message, MessageType} from '../model/Chat';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import FloatingOffer from '../components/chat/FloatingOffer';
import {UserRole} from '../model/User';
import {Offer} from '../model/Offer';
import {useNavigation} from '@react-navigation/native';
import {Pressable} from 'react-native';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ChatDetail
>;
const ChatScreen = ({route}: Props) => {
  const {chat} = route.params;
  const [chatData, setChatData] = useState<Chat>(chat.chat);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const {uid, user, activeRole} = useUser();

  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false);
  const navigation = useNavigation<NavigationStackProps>();

  useEffect(() => {
    const chatRef = Chat.getDocumentReference(chat.chat.id ?? '');

    const unsubscribe = chatRef.onSnapshot(doc => {
      if (doc.exists) {
        const updatedChatData = doc.data() as Chat;
        setChatData(updatedChatData);
      }
    });

    return () => unsubscribe();
  }, [chat.chat.id]);

  const businessPeopleId = chat.chat.participants.find(
    participant => participant.role === UserRole.BusinessPeople,
  );
  const contentCreatorId = chat.chat.participants.find(
    participant => participant.role === UserRole.BusinessPeople,
  );

  useEffect(() => {
    Offer.getPendingOffersbyCCBP(
      businessPeopleId?.ref ?? '',
      contentCreatorId?.ref ?? '',
      res => {
        const sortedTransactions = res
          .slice()
          .sort((a, b) => b.createdAt - a.createdAt);
        setOffers(sortedTransactions);
      },
    );
  }, [businessPeopleId, contentCreatorId]);

  console.log(offers);
  useEffect(() => {
    if (chatData.messages) {
      setChatMessages(chatData.messages);
    }
  }, [chatData.messages]);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendPress = async (message: string) => {
    if (message !== '') {
      const newMessage: Message = {
        message: message,
        role: activeRole!!,
        type: MessageType.Text,
        createdAt: new Date().getTime(),
      };
      await new Chat(chat.chat).insertMessage(newMessage);
      setChatMessages([...chatMessages, newMessage]);

      // Scroll to the end of the ScrollView
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }

      // Clear the input field
      console.log(`Sending message: ${message}`);
    }
  };

  // Handle opening the widget
  const handleOpenWidgetPress = () => {
    setIsWidgetVisible(!isWidgetVisible);
    console.log(`Opening widget: ${isWidgetVisible}`);
  };

  const handleImageUpload = async (downloadURL: string) => {
    // Create a new message with the image download URL
    const newMessage: Message = {
      message: downloadURL,
      type: MessageType.Photo,
      role: activeRole!!,
      createdAt: new Date().getTime(),
    };

    // Add the new message to the chatMessages state
    setChatMessages([...chatMessages, newMessage]);
    await new Chat(chat.chat).insertMessage(newMessage);

    // Scroll to the end of the ScrollView
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  const handleMakeOffer = () => {
    navigation.navigate(AuthenticatedNavigation.MakeOffer, {
      businessPeopleId: businessPeopleId?.ref ?? '',
      contentCreatorId: contentCreatorId?.ref ?? '',
    });
  };

  const handleNegotiationComplete = () => {
    // Fetch updated offers and set them in the state
    Offer.getPendingOffersbyCCBP(
      businessPeopleId?.ref ?? '',
      contentCreatorId?.ref ?? '',
      res => {
        const sortedTransactions = res
          .slice()
          .sort((a, b) => b.createdAt - a.createdAt);
        setOffers(sortedTransactions);
      },
    );
  };

  return (
    <SafeAreaContainer>
      <View
        className="h-full w-full"
        style={[flex.flexCol, background(COLOR.white)]}>
        {/* Chat Header */}
        <View className="items-center justify-start" style={[flex.flexRow]}>
          <ChatHeader
            recipientName={chat.recipient?.fullname ?? ''}
            recipientPicture={chat.recipient?.profilePicture ?? ''}
          />
        </View>

        {/* Floating Tab */}
        {/* if there is offer then add margin top for the chats */}
        {offers && offers.length > 0 && (
          <FloatingOffer
            offers={offers}
            recipientName={chat.recipient?.fullname ?? ''}
            onNegotiationComplete={handleNegotiationComplete}
          />
        )}

        {/* Chat Messages */}
        <ScrollView
          className={`offers ${offers && offers.length > 0 ? 'mt-16' : ''}`}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }
          }}>
          <Pressable onPress={() => setIsWidgetVisible(false)}>
            <View style={[flex.flexCol, gap.default]} className="py-3">
              {chatMessages &&
                chatMessages.map((message: Message, index: number) => (
                  <HorizontalPadding key={index} paddingSize="xsmall2">
                    <View className="w-full px-3">
                      <ChatBubble
                        key={index}
                        message={message.message}
                        isSender={message.role === activeRole}
                        type={message.type}
                      />
                    </View>
                  </HorizontalPadding>
                ))}
            </View>
          </Pressable>
        </ScrollView>

        <View className="py-4 border-t-[0.5px]">
          {/* Chat Input Bar */}
          <ChatInputBar
            onSendPress={handleSendPress}
            onOpenWidgetPress={handleOpenWidgetPress}
            isWidgetVisible={isWidgetVisible}
          />

          {/* Chat Widget */}
          {isWidgetVisible ? (
            <View className="w-full">
              <ChatWidget
                options={{
                  width: 400,
                  height: 400,
                  cropping: true,
                }}
                handleImageUpload={handleImageUpload}
                handleMakeOffer={handleMakeOffer}
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default ChatScreen;
