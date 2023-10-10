import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';

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
    <View className="px-5 w-full flex flex-row justify-start items-center gap-5">
      <TouchableOpacity onPress={onSendPhotoPress}>
        {/* Send Photo Button */}
        <View className="flex flex-col justify-center items-center">
          <PhotosIcon width={70} height={70} />
          <Text>Photos</Text>
        </View>
      </TouchableOpacity>
      {/* Make Offer Button */}
      <TouchableOpacity onPress={onMakeOfferPress}>
        <View className="flex flex-col justify-center items-center">
          {/* Wrap the content with a function */}
          <View>
            <MakeOfferIcon width={70} height={70} />
            <Text>Make Offer</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatWidget;
