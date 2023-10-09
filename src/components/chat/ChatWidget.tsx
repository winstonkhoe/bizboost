import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

const ChatWidget = () => {
  // Handle send photo button
  const onSendPhotoPress = () => {
    console.log('Send photo widget');
  };

  // Handle make offer button
  const onMakeOfferPress = () => {
    console.log('Make offer widget');
  };

  return (
    <View className="h-full bg-red-500 h-1/4 flex flex-row justify-start items-center">
      <TouchableOpacity onPress={onSendPhotoPress}>
        {/* Send Photo Button */}
        <Text>Send Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onMakeOfferPress}>
        {/* Make Offer Button */}
        <Text>Make Offer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ChatWidget;
