import React from 'react';
import {View, Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {Message} from '../../screens/ChatScreen';
import {flex, items} from '../../styles/Flex';

const ChatBubble = ({message, isSender, profilePic}: Message) => {
  return (
    <View
      className="w-full"
      style={[
        isSender
          ? {...flex.flexRowReverse, ...items.end}
          : {...flex.flexRow, ...items.start},
      ]}>
      {/* <Image source={{uri: profilePic}} style={{width: 40, height: 40}} /> */}
      <View
        className="w-11/12"
        style={{
          backgroundColor: isSender ? '#CEE0E8' : '#E5E5EA',
          borderRadius: 10,
          padding: 10,
        }}>
        <Text style={[textColor(COLOR.black)]}>{message}</Text>
      </View>
    </View>
  );
};

export default ChatBubble;
