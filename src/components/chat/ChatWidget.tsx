import React from 'react';
import {View, Text, Pressable} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';
import {gap} from '../../styles/Gap';
import {MediaUploader} from '../atoms/Input';
import {flex} from '../../styles/Flex';
import {Options, ImageOrVideo} from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import uuid from 'react-native-uuid';

interface Props {
  options: Options;
  handleImageUpload: (downloadURL: string) => void;
}

const ChatWidget = ({options, handleImageUpload}: Props) => {
  // Handle make offer button
  const onMakeOfferPress = () => {
    console.log('Make offer widget');
  };

  // TODO: extract to utility function
  const imageSelected = (media: ImageOrVideo) => {
    console.log(media);
    const imageType = media.mime.split('/')[1];
    const filename = `${uuid.v4()}.${imageType}`;

    const reference = storage().ref(filename);
    const task = reference.putFile(media.path);

    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );
    });

    task.then(async () => {
      try {
        // i want to call handleImageUpload here
        console.log('Image uploaded to the bucket!');
        const downloadURL = await reference.getDownloadURL();
        console.log(
          '[ChatWidget.tsx: imageSelected] download url: ' + downloadURL,
        );
        handleImageUpload(downloadURL);
      } catch (e) {
        console.log(e);
      }
    });
  };

  return (
    <View
      className="bg-white py-5 px-5 w-full flex flex-row justify-start items-center"
      style={gap.default}>
      {/* Send Photo Button */}
      <MediaUploader
        targetFolder="chats"
        options={options}
        onMediaSelected={imageSelected}>
        <View style={[flex.flexCol]} className="justify-center items-center">
          <View className="w-16 h-16 bg-[#E7F3F8] rounded-full flex justify-center items-center">
            <PhotosIcon width={30} height={30} />
          </View>
          <Text>Photos</Text>
        </View>
      </MediaUploader>

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
