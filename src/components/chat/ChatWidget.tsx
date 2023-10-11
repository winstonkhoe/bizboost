import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';
import {gap} from '../../styles/Gap';

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
    <View
      className="bg-white py-5 px-5 w-full flex flex-row justify-start items-center"
      style={gap.small}>
      {/* Send Photo Button */}
      <Pressable
        onPress={onSendPhotoPress}
        className="flex flex-col justify-center items-center">
        <View className="w-20 h-20 bg-[#E7F3F8] rounded-full flex justify-center items-center">
          <PhotosIcon width={30} height={30} />
        </View>
        <Text>Photos</Text>
      </Pressable>
      {/* Make Offer Button */}
      <Pressable
        onPress={onMakeOfferPress}
        className="flex flex-col justify-center items-center">
        <View className="w-20 h-20 bg-[#E7F3F8] rounded-full flex justify-center items-center">
          <MakeOfferIcon width={30} height={30} />
        </View>
        <Text>Make Offer</Text>
      </Pressable>
    </View>
  );
};

export default ChatWidget;
