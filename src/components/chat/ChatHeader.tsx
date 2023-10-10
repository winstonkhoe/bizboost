import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BackNav from '../../assets/vectors/left-navigation-back.svg';

const ChatHeader = ({recipientName, lastOnline}) => {
  const navigation = useNavigation();

  const handleBackButtonPress = () => {
    // Handle back button press here
    navigation.goBack();
  };

  return (
    <View className="border-b border-b-gray-400 flex flex-row items-center justify-start pt-1 pb-3 gap-3 px-2">
      <TouchableOpacity onPress={handleBackButtonPress}>
        <BackNav width={30} height={20} />
      </TouchableOpacity>
      <View className="w-10 h-10 rounded-full overflow-hidden">
        <Image
          source={require('../../assets/images/sample-influencer.jpeg')}
          alt=""
          className="w-full h-full object-cover"
        />
      </View>
      <View className="flex flex-col">
        <Text className="text-lg font-bold text-black">{recipientName}</Text>
        <Text className="text-md text-black">Last Online: {lastOnline}</Text>
      </View>
    </View>
  );
};

export default ChatHeader;
