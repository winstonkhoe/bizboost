import React from 'react';
import {View, Text, Image} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {Message} from '../../screens/ChatScreen';
import {flex, items} from '../../styles/Flex';
import {MessageType} from '../../model/Chat';
import FirebaseStorageImage from '../molecules/FirebaseStorageImage';

const ChatBubble = ({message, isSender, type}: Message) => {
  return (
    <View
      className="w-full"
      style={[
        isSender
          ? {...flex.flexRowReverse, ...items.end}
          : {...flex.flexRow, ...items.start},
      ]}>
      {type === MessageType.Text && (
        <View
          style={{
            backgroundColor: isSender ? '#CEE0E8' : '#E5E5EA',
            borderRadius: 10,
            padding: 10,
            maxWidth: '80%',
          }}>
          <Text style={[textColor(COLOR.black)]}>{message}</Text>
        </View>
      )}
      {type === MessageType.Photo && (
        <View
          style={{
            borderRadius: 20,
            maxWidth: '80%',
          }}>
          <FirebaseStorageImage imageUrl={message} />
        </View>
      )}
    </View>
  );
};

export default ChatBubble;
