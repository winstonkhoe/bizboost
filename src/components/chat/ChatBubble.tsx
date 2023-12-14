import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import {Message, MessageType} from '../../model/Chat';
import FastImage from 'react-native-fast-image';

const ChatBubble = ({message, isSender, type}: Message) => {
  return (
    <View
      className="w-full"
      style={[
        type === MessageType.System
          ? {...flex.flexRow, ...justify.center, ...items.center}
          : isSender
          ? {...flex.flexRowReverse, ...items.end}
          : {...flex.flexRow, ...items.start},
      ]}>
      {type === MessageType.Text && (
        <View style={styles.chat(isSender)}>
          <Text style={[textColor(COLOR.black[100])]}>{message}</Text>
        </View>
      )}
      {type === MessageType.Offer && (
        <View style={styles.chat(isSender)}>
          <Text style={[textColor(COLOR.black[100])]}>MADE AN OFFER</Text>
          <Text style={[textColor(COLOR.black[100])]} className="font-bold">
            Rp. {message}
          </Text>
        </View>
      )}
      {type === MessageType.Negotiation && (
        <View style={styles.chat(isSender)}>
          <Text style={[textColor(COLOR.black[100])]}>MADE A NEGOTIATION</Text>
          <Text style={[textColor(COLOR.black[100])]} className="font-bold">
            Rp. {message}
          </Text>
        </View>
      )}
      {type === MessageType.Photo && (
        <View style={styles.chat(isSender)}>
          <View style={styles.container}>
            {message && (
              <FastImage source={{uri: message}} style={styles.image} />
            )}
          </View>
          <Text style={[textColor(COLOR.black[100])]}>{message}</Text>
        </View>
      )}
      {type === MessageType.System && (
        <View>
          <Text style={[textColor(COLOR.black[100]), styles.system]}>
            {message}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  system: {
    fontWeight: 'bold',
  },
  chat: isSender => ({
    borderRadius: 10,
    padding: 10,
    maxWidth: '80%',
    backgroundColor: isSender ? '#CEE0E8' : '#E5E5EA',
  }),
});

export default ChatBubble;
