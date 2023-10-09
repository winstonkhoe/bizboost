import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const ChatHeader = ({recipientName, lastOnline}) => {
  const navigation = useNavigation();

  const handleBackButtonPress = () => {
    // Handle back button press here
    navigation.goBack();
  };

  return (
    <View>
      <TouchableOpacity onPress={handleBackButtonPress}>
        {/* Back Button */}
        {/* You can use an icon library like react-native-vector-icons for the back arrow */}
        <Text>Back</Text>
      </TouchableOpacity>
      <Text>{recipientName}</Text>
      <Text>Last Online: {lastOnline}</Text>
    </View>
  );
};

export default ChatHeader;
