import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';
import {gap} from '../../styles/Gap';

const ChatWidget = ({onImageUpload}) => {
  // Handle make offer button
  const onMakeOfferPress = () => {
    console.log('Make offer widget');
  };

  const onPhotoPress = () => {
    console.log('Image upload test');
    onImageUpload('photo');
  };

  return (
    <View
      className="bg-white py-5 px-5 w-full flex flex-row justify-start items-center"
      style={gap.default}>
      {/* Send Photo Button */}
      <Pressable
        onPress={onPhotoPress}
        className="flex flex-col justify-center items-center">
        <View className="w-16 h-16 bg-[#E7F3F8] rounded-full flex justify-center items-center">
          <PhotosIcon width={30} height={30} />
        </View>
        <Text>Photos</Text>
      </Pressable>
      {/* Make Offer Button */}
      <Pressable
        onPress={onMakeOfferPress}
        className="flex flex-col justify-center items-center">
        <View className="w-16 h-16 bg-[#E7F3F8] rounded-full flex justify-center items-center">
          <MakeOfferIcon width={30} height={30} />
        </View>
        <Text>Make Offer</Text>
      </Pressable>
    </View>
  );
};

export default ChatWidget;
