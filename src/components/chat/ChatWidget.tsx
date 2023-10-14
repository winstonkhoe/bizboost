import React from 'react';
import {View, Text, Pressable} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';
import {gap} from '../../styles/Gap';
import ImageLibraryLauncher from '../atoms/ImageLibraryLauncher';
import {flex} from '../../styles/Flex';

const ChatWidget = ({options}) => {
  // Handle make offer button
  const onMakeOfferPress = () => {
    console.log('Make offer widget');
  };

  return (
    <View
      className="bg-white py-5 px-5 w-full flex flex-row justify-start items-center"
      style={gap.default}>
      {/* Send Photo Button */}
      <ImageLibraryLauncher
        options={options}
        icon={
          <View style={[flex.flexCol]} className="justify-center items-center">
            <View className="w-16 h-16 bg-[#E7F3F8] rounded-full flex justify-center items-center">
              <PhotosIcon width={30} height={30} />
            </View>
            <Text>Photos</Text>
          </View>
        }
      />
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
