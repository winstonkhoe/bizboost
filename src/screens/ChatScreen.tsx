import React, {useState, useRef} from 'react';
import {View, Text, ScrollView} from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import ChatBubble from '../components/chat/ChatBubble';
import ChatInputBar from '../components/chat/ChatInputBar';
import ChatWidget from '../components/chat/ChatWidget';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/GuestNavigation'; // temporary
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

import {useUser} from '../hooks/user';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const ChatScreen = () => {
  const [isWidgetVisible, setIsWidgetVisible] = useState(false); // State to track widget visibility
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const {user, activeRole} = useUser();

  console.log(user);

  const scrollViewRef = useRef();

  // Handle sending a message
  const handleSendPress = message => {
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

  // Image launcher options
  let options = {
    mediaType: 'photo',
    maxWidth: 300,
    maxHeight: 550,
  };

  const handleImageUpload = async response => {
    console.log(response);
    const tempImageUri = response.uri;

    try {
      const imageFileName = 'your_unique_filename.jpg';
      const imageRef = storage().ref(`images/${imageFileName}`);

      // Upload the image to Firebase Cloud Storage
      await imageRef.putFile(tempImageUri);

      // Get the download URL of the uploaded image
      const downloadURL = await imageRef.getDownloadURL();

      // Create a new message with the image download URL
      const newMessage = {
        message: downloadURL,
        isSender: true, // Assuming the sender is the user
        profilePic: 'user_profile_url',
        isImage: true, // Add a flag to identify that it's an image
      };

      // Add the new message to the chatMessages state
      setChatMessages([...chatMessages, newMessage]);

      // Scroll to the end of the ScrollView
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({animated: true});
      }
    } catch (error) {
      console.error('Error uploading the image to Firebase:', error);
    }
  };

  return (
    <SafeAreaContainer>
      <View className="bg-white h-full w-full flex flex-col">
        {/* Chat Header */}
        <View className="border-b-[0.5px] border-gray-400 flex items-center justify-start py-3">
          <ChatHeader recipientName="Recipient Name" lastOnline="1h ago" />
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollToEnd({animated: true});
            }
          }}>
          <View className="flex flex-col gap-y-4 py-4">
            {chatMessages.map((message, index) => (
              <View key={index} className="w-full px-3">
                <ChatBubble
                  key={index}
                  message={message.message}
                  isSender={message.isSender}
                  profilePic={message.profilePic}
                />
              </View>
            ))}
          </View>
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
                options={options}
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
