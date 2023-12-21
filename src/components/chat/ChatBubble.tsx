import React, {ReactNode} from 'react';
import {View, Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import {Message, MessageType} from '../../model/Chat';
import FastImage from 'react-native-fast-image';
import {background} from '../../styles/BackgroundColor';
import {font} from '../../styles/Font';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {overflow} from '../../styles/Overflow';
import {dimension} from '../../styles/Dimension';

interface ChatBubbleProps {
  message: Message;
  isSender: boolean;
}

const ChatBubble = ({message, isSender}: ChatBubbleProps) => {
  const isSystemMessage = message.type === MessageType.System;
  const isTextMessage = message.type === MessageType.Text;
  const isPhotoMessage = message.type === MessageType.Photo;
  const isOfferMessage = message.type === MessageType.Offer;
  const isNegotiationMessage = message.type === MessageType.Negotiation;
  return (
    <View
      style={[
        isSystemMessage && [flex.flexRow, justify.center, items.center],
        !isSystemMessage && isSender && [flex.flexRowReverse, items.end],
        !isSystemMessage && !isSender && [flex.flexRow, items.start],
      ]}>
      <BubbleContainer isSender={isSender}>
        {isTextMessage && (
          <Text style={[textColor(COLOR.text.neutral.high)]}>
            {message.message}
          </Text>
        )}
        {isOfferMessage && (
          <>
            <Text style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
              Made an offer
            </Text>
            <Text
              style={[
                font.size[30],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}>
              Rp. {message.message}
            </Text>
          </>
        )}
        {isNegotiationMessage && (
          <>
            <Text style={[textColor(COLOR.text.neutral.high)]}>
              MADE A NEGOTIATION
            </Text>
            <Text
              style={[textColor(COLOR.text.neutral.high), font.weight.bold]}>
              Rp. {message.message}
            </Text>
          </>
        )}
        {isPhotoMessage && (
          <>
            <View
              style={[
                dimension.square.xlarge10,
                rounded.default,
                overflow.hidden,
              ]}>
              {message && (
                <FastImage
                  source={{uri: message.message}}
                  style={[dimension.full]}
                />
              )}
            </View>
          </>
        )}
      </BubbleContainer>
      {isSystemMessage && (
        <View>
          <Text style={[textColor(COLOR.text.neutral.high), font.weight.bold]}>
            {message.message}
          </Text>
        </View>
      )}
    </View>
  );
};

interface BubbleContainerProps {
  isSender: boolean;
  children: ReactNode;
}

const BubbleContainer = ({isSender, children}: BubbleContainerProps) => {
  return (
    <View
      style={[
        rounded.medium,
        background(COLOR.green[5]),
        {
          maxWidth: '70%',
        },
        padding.default,
      ]}>
      {children}
    </View>
  );
};

export default ChatBubble;
