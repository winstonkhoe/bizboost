import React from 'react';
import {View, Text, Image} from 'react-native';

const ChatBubble = ({message, isSender, profilePic, isImage}) => {
  return (
    <View
      className="flex w-full"
      style={{flexDirection: isSender ? 'row-reverse' : 'row'}}>
      {/* <Image source={{uri: profilePic}} style={{width: 40, height: 40}} /> */}
      <View
        style={{
          backgroundColor: isSender ? '#CEE0E8' : '#E5E5EA',
          borderRadius: 10,
          padding: 10,
        }}>
        {isImage ? (
          <Image source={{uri: message}} style={{width: 150, height: 150}} />
        ) : (
          <Text style={{color: 'black'}}>{message}</Text>
        )}
      </View>
    </View>
  );
};

export default ChatBubble;
