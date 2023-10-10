import React, {useState} from 'react';
import {View, Text, ScrollView} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation'; // temporary
import SafeAreaContainer from '../containers/SafeAreaContainer';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen = () => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false); // State to track widget visibility

  // Sample chat messages data
  const chatMessages = [
    {
      message:
        'Hi there, thank you for considering me for your campaign. I’m excited to work with you and create some amazing content.',
      isSender: false,
      profilePic: 'profile_url_1',
    },
    {
      message: 'Hi, we’re excited to work with you too.',
      isSender: true,
      profilePic: 'profile_url_2',
    },
    {
      message: 'Can you give us an idea of your rates for this campaign?',
      isSender: true,
      profilePic: 'profile_url_2',
    },
    {
      message:
        'Sure, my standard rate for a campaign like this is $5,000. This includes the creation of 5 pieces of content, each with a unique concept and execution.',
      isSender: false,
      profilePic: 'profile_url_1',
    },
    {
      message:
        'That sounds reasonable. However, our budget for this campaign is $4,000. Is there any room for negotiation?',
      isSender: true,
      profilePic: 'profile_url_2',
    },
    {
      message:
        'I understand that budgets can be tight. I’m willing to work with you to find a solution that works for both of us. How about we reduce the number of content pieces to 4, and I can offer you a rate of $4,500?',
      isSender: false,
      profilePic: 'profile_url_1',
    },
    {
      message:
        'That sounds like a fair compromise. Let’s move forward with that.',
      isSender: true,
      profilePic: 'profile_url_2',
    },
    {
      message:
        'Great! I’m looking forward to working with you on this campaign.',
      isSender: false,
      profilePic: 'profile_url_1',
    },
    {
      message:
        'Great! I’m looking forward to working with you on this campaign.',
      isSender: false,
      profilePic: 'profile_url_1',
    },
    {
      message:
        'Great! I’m looking forward to working with you on this campaign.',
      isSender: false,
      profilePic: 'profile_url_1',
    },
  ];

  // Handle sending a message
  const handleSendPress = message => {
    console.log(`Sending message: ${message}`);
  };

  // Handle opening the widget
  const handleOpenWidgetPress = () => {
    setIsWidgetVisible(!isWidgetVisible);
    console.log(`Opening widget: ${isWidgetVisible}`);
  };

  return (
    <SafeAreaContainer>
      <View className="h-full w-full flex flex-col justify-between py-3">
        {/* Chat Header */}
        <View className="self-start h-[10%]">
          <ChatHeader recipientName="Recipient Name" lastOnline="1h ago" />
        </View>

        {/* Chat Messages */}
        <ScrollView className="relative flex flex-col gap-y-5">
          {chatMessages.map((message, index) => (
            <View key={index} className="w-full px-2">
              <ChatBubble
                key={index}
                message={message.message}
                isSender={message.isSender}
                profilePic={message.profilePic}
              />
            </View>
          ))}
        </ScrollView>

        {/* Chat Input Bar */}
        <ChatInputBar
          onSendPress={handleSendPress}
          onOpenWidgetPress={handleOpenWidgetPress}
        />

        {/* Chat Widget */}
        {isWidgetVisible && (
          // Render the widget only when isWidgetVisible is true
          <ChatWidget />
        )}
      </View>
    </SafeAreaContainer>
  );
};

export default ChatScreen;
