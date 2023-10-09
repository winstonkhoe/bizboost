import React, {useState} from 'react';
import {View, Text} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation'; // temporary

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen = () => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false); // State to track widget visibility

  // Sample chat messages data
  const chatMessages = [
    {message: 'Hi there!', isSender: false, profilePic: 'profile_url_1'},
    {message: 'Hello!', isSender: true, profilePic: 'profile_url_2'},
  ];

  // Handle sending a message
  const handleSendPress = message => {
    console.log(`Sending message: ${message}`);
  };

  // Handle opening the widget
  const handleOpenWidgetPress = () => {
    setIsWidgetVisible(!isWidgetVisible); // Toggle the visibility of the widget
  };

  // Handle sending a photo
  const handleSendPhotoPress = () => {
    console.log('Sending photo');
  };

  // Handle making an offer
  const handleMakeOfferPress = () => {
    console.log('Making offer');
  };

  return (
    <View className="h-full w-full flex flex-col justify-between py-3 px-5">
      {/* Chat Header */}
      <ChatHeader recipientName="Recipient Name" lastOnline="Last Online" />

      {/* Chat Messages */}
      <View>
        {chatMessages.map((message, index) => (
          <ChatBubble
            key={index}
            message={message.message}
            isSender={message.isSender}
            profilePic={message.profilePic}
          />
        ))}
      </View>

      <View className="bg-yellow-400 flex flex-col justify-between">
        {/* Chat Input Bar */}
        <ChatInputBar
          onSendPress={handleSendPress}
          onOpenWidgetPress={handleOpenWidgetPress}
        />

        {/* Chat Widget */}
        {isWidgetVisible && ( // Render the widget only when isWidgetVisible is true
          <ChatWidget />
        )}
      </View>
    </View>
  );
};

export default ChatScreen;
