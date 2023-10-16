import React, {useState, useRef} from 'react';
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
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {gap} from '../styles/Gap';

export interface Message {
  message: string;
  isSender: boolean;
  profilePic: string;
}

const ChatScreen = () => {
  const [isWidgetVisible, setIsWidgetVisible] = useState<boolean>(false); // State to track widget visibility
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const {user, activeRole} = useUser();

  console.log(user);

  const scrollViewRef = useRef<ScrollView>(null);

  // Handle sending a message
  const handleSendPress = (message: string) => {
    // Add the new message to the chatMessages state
    if (message !== '') {
      const newMessage = {
        message,
        isSender: true,
        profilePic: 'user_profile_url',
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

  return (
    <SafeAreaContainer>
      <View
        className="h-full w-full"
        style={[flex.flexCol, background(COLOR.white)]}>
        {/* Chat Header */}
        <View
          className="border-b-[0.5px] border-gray-400 items-center justify-start py-3"
          style={[flex.flexRow]}>
          <ChatHeader recipientName="Recipient Name" lastOnline="1h ago" />
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
              {chatMessages.map((message: Message, index: number) => (
                <HorizontalPadding key={index} paddingSize="xsmall2">
                  <View className="w-full px-3">
                    <ChatBubble
                      key={index}
                      message={message.message}
                      isSender={message.isSender}
                      profilePic={message.profilePic}
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
                  width: 300,
                  height: 400,
                  cropping: true,
                }}
              />
            </View>
          ) : null}
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default ChatScreen;
