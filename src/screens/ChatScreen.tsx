import React from 'react';
import {View, Text} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader'; // Import your ChatHeader component
import ChatBubble from '../components/chat/ChatBubble'; // Import your ChatBubble component
import ChatInputBar from '../components/chat/ChatInputBar'; // Import your ChatInputBar component
import ChatWidget from '../components/chat/ChatWidget'; // Import your ChatWidget component

const ChatScreen = () => {
  // Sample chat messages data (you can replace this with your own data)
  const chatMessages = [
    {message: 'Hi there!', isSender: false, profilePic: 'profile_url_1'},
    {message: 'Hello!', isSender: true, profilePic: 'profile_url_2'},
    // Add more chat messages here
  ];

  // Handle sending a message
  const handleSendPress = message => {
    // Implement message sending logic here
    console.log(`Sending message: ${message}`);
  };

  // Handle opening the widget
  const handleOpenWidgetPress = () => {
    // Implement widget opening logic here
    console.log('Opening widget');
  };

  // Handle sending a photo
  const handleSendPhotoPress = () => {
    // Implement send photo logic here
    console.log('Sending photo');
  };

  // Handle making an offer
  const handleMakeOfferPress = () => {
    // Implement make offer logic here
    console.log('Making offer');
  };

  return (
    <View style={{flex: 1}}>
      {/* Chat Header */}
      <ChatHeader recipientName="Recipient Name" lastOnline="Last Online" />

      {/* Chat Messages */}
      {chatMessages.map((message, index) => (
        <ChatBubble
          key={index}
          message={message.message}
          isSender={message.isSender}
          profilePic={message.profilePic}
        />
      ))}

      {/* Chat Input Bar */}
      <ChatInputBar
        onSendPress={handleSendPress}
        onOpenWidgetPress={handleOpenWidgetPress}
      />

      {/* Chat Widget */}
      <ChatWidget
        onSendPhotoPress={handleSendPhotoPress}
        onMakeOfferPress={handleMakeOfferPress}
      />
    </View>
  );
};

export default ChatScreen;
