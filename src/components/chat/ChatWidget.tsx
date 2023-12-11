import React from 'react';
import {View, Text, Pressable} from 'react-native';
import PhotosIcon from '../../assets/vectors/photos.svg';
import MakeOfferIcon from '../../assets/vectors/make-offer.svg';
import {gap} from '../../styles/Gap';
import {MediaUploader} from '../atoms/Input';
import {flex} from '../../styles/Flex';
import {Options} from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';

interface Props {
  options: Options;
  handleImageUpload: (downloadURL: string) => void;
  businessPeopleId: string;
  contentCreatorId: string;
}

const ChatWidget = ({
  options,
  handleImageUpload,
  businessPeopleId,
  contentCreatorId,
}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();

  return (
    <View
      className="bg-white py-5 px-5 w-full flex flex-row justify-start items-center"
      style={gap.default}>
      {/* Send Photo Button */}
      <MediaUploader
        targetFolder="chats"
        options={options}
        onUploadSuccess={handleImageUpload}>
        <View style={[flex.flexCol]} className="justify-center items-center">
          <View className="w-16 h-16 bg-[#E7F3F8] rounded-full flex justify-center items-center">
            <PhotosIcon width={30} height={30} />
          </View>
          <Text>Photos</Text>
        </View>
      </MediaUploader>

      {/* Make Offer Button */}
      <Pressable
        onPress={() =>
          navigation.navigate(AuthenticatedNavigation.MakeOffer, {
            businessPeopleId: businessPeopleId,
            contentCreatorId: contentCreatorId,
          })
        }
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
