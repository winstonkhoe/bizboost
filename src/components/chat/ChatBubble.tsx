import React from 'react';
import {View, Text, Image} from 'react-native';

const ChatBubble = ({message, isSender, profilePic}) => {
  return (
    <View style={{flexDirection: isSender ? 'row-reverse' : 'row'}}>
      <Image source={{uri: profilePic}} style={{width: 40, height: 40}} />
      <View
        style={{
          backgroundColor: isSender ? '#007AFF' : '#E5E5EA',
          borderRadius: 10,
          padding: 10,
        }}>
        <Text style={{color: isSender ? 'white' : 'black'}}>{message}</Text>
      </View>
    </View>
  );
};

export default ChatBubble;
