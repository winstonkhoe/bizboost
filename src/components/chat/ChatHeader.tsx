import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackNav from '../../assets/vectors/chevron-left.svg';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import FastImage from 'react-native-fast-image';

interface Props {
  recipientName: string;
  recipientPicture: string;
}

const ChatHeader = ({recipientName, recipientPicture}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();

  const handleBackButtonPress = () => {
    navigation.navigate(AuthenticatedNavigation.Main);
  };

  let profilePictureSource = require('../../assets/images/sample-influencer.jpeg');

  if (recipientPicture) {
    profilePictureSource = {uri: recipientPicture};
  }

  return (
    <View
      className="h-16 w-full flex flex-row items-center justify-start px-2 border-b-[0.5px] border-gray-400 "
      style={[gap.default]}>
      <TouchableOpacity onPress={handleBackButtonPress}>
        <BackNav width={30} height={20} color={COLOR.black[100]} />
      </TouchableOpacity>
      <View className="w-10 h-10 rounded-full overflow-hidden">
        <FastImage
          source={profilePictureSource}
          className="w-full h-full object-cover"
        />
      </View>
      <View className="flex flex-col">
        <Text className="text-lg font-bold text-black">{recipientName}</Text>
      </View>
    </View>
  );
};

export default ChatHeader;
