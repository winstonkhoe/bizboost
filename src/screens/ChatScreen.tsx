import React, {useState, useRef, useEffect} from 'react';
import {View, ScrollView} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import storage from '@react-native-firebase/storage';

import {useUser} from '../hooks/user';
import {flex} from '../styles/Flex';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {gap} from '../styles/Gap';
import {Chat, ChatView, Message, MessageType} from '../model/Chat';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  RootAuthenticatedNativeStackParamList,
} from '../navigation/AuthenticatedNavigation';
import {UserRole} from '../model/User';

type Props = NativeStackScreenProps<
  RootAuthenticatedNativeStackParamList,
  AuthenticatedNavigation.Chat
>;
const ChatScreen = ({route}: Props) => {
  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false); // State to track widget visibility
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const {uid, user, activeRole} = useUser();

  const {chat} = route.params;
  console.log('profpic:' + chat.recipient.profilePicture);

  useEffect(() => {
    // Assuming that chat.messages is an array of Message objects
    if (chat.chat.messages) {
      setChatMessages(chat.chat.messages);
    }
  }, [chat.messages]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Handle sending a message
  const handleSendPress = (message: string) => {
    // Add the new message to the chatMessages state
    if (message !== '') {
      const newMessage: Message = {
        message: message,
        sender: uid,
        type: MessageType.Text,
      };
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
    const tempImageUri = response.uri;

    // Create a new message with the image download URL
    const newMessage: Message = {
      message: downloadURL,
      type: MessageType.Photo,
      sender: uid,
    };

    // Add the new message to the chatMessages state
    setChatMessages([...chatMessages, newMessage]);

    // Scroll to the end of the ScrollView
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  };

  return (
    <SafeAreaContainer>
      <View
        className="h-full w-full"
        style={[flex.flexCol, background(COLOR.white)]}>
        {/* Chat Header */}
        <View
          className="border-b-[0.5px] border-gray-400 items-center justify-start py-3"
          style={[flex.flexRow]}>
          <ChatHeader
            recipientName={chat.recipient.fullname}
            recipientPicture={chat.recipient.profilePicture}
          />
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }
          }}>
          <VerticalPadding>
            <View style={[flex.flexCol, gap.default]}>
              {chatMessages &&
                chatMessages.map((message: Message, index: number) => (
                  <HorizontalPadding key={index} paddingSize="xsmall2">
                    <View className="w-full px-3">
                      <ChatBubble
                        key={index}
                        message={message.message}
                        isSender={message.sender === uid}
                        profilePic={
                          activeRole === UserRole.BusinessPeople
                            ? user?.businessPeople?.profilePicture
                            : user?.contentCreator?.profilePicture
                        }
                      />
                    </View>
                  </HorizontalPadding>
                ))}
            </View>
          </VerticalPadding>
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
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default ChatScreen;
