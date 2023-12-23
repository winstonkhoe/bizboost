import React, {ReactNode} from 'react';
import {View, Text} from 'react-native';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {flex, items, justify, self} from '../../styles/Flex';
import {Message, MessageType} from '../../model/Chat';
import FastImage from 'react-native-fast-image';
import {background} from '../../styles/BackgroundColor';
import {font, text} from '../../styles/Font';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {overflow} from '../../styles/Overflow';
import {dimension} from '../../styles/Dimension';
import {formatDateToHourMinute} from '../../utils/date';
import {gap} from '../../styles/Gap';
import {SizeType, size} from '../../styles/Size';

interface ChatBubbleProps {
  message: Message;
  isSender: boolean;
  isStart?: boolean;
  isLast?: boolean;
}

const ChatBubble = ({
  message,
  isSender,
  isStart = false,
  isLast = false,
}: ChatBubbleProps) => {
  const isSystemMessage = message.type === MessageType.System;
  const isTextMessage = message.type === MessageType.Text;
  const isPhotoMessage = message.type === MessageType.Photo;
  const isOfferMessage = message.type === MessageType.Offer;
  const isNegotiationMessage = message.type === MessageType.Negotiation;
  return (
    <View
      style={[
        gap.xsmall,
        items.end,
        isSystemMessage && [flex.flexRow, justify.center],
        !isSystemMessage && isSender && [flex.flexRowReverse],
        !isSystemMessage && !isSender && [flex.flexRow],
      ]}>
      {!isSystemMessage && [
        <BubbleContainer
          key={`chat-container-${message.createdAt}`}
          isSender={isSender}
          isStart={isStart}
          isLast={isLast}>
          {isTextMessage && (
            <Text
              style={[
                textColor(COLOR.text.neutral.high),
                isSender && [textColor(COLOR.absoluteBlack[90])],
                font.size[20],
              ]}>
              {message.message}
            </Text>
          )}
          {isOfferMessage && (
            <>
              <Text style={[textColor(COLOR.absoluteBlack[90]), font.size[30]]}>
                Made an offer
              </Text>
              <Text
                style={[
                  font.size[30],
                  font.weight.bold,
                  textColor(COLOR.absoluteBlack[90]),
                ]}>
                Rp. {message.message}
              </Text>
            </>
          )}
          {isNegotiationMessage && (
            <>
              <Text style={[textColor(COLOR.absoluteBlack[90])]}>
                MADE A NEGOTIATION
              </Text>
              <Text
                style={[textColor(COLOR.absoluteBlack[90]), font.weight.bold]}>
                Rp. {message.message}
              </Text>
            </>
          )}
          {isPhotoMessage && (
            <>
              <View
                style={[
                  dimension.square.xlarge10,
                  rounded.medium,
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
        </BubbleContainer>,
        <View
          key={`date-container-${message.createdAt}`}
          style={[padding.bottom.xsmall]}>
          <Text
            style={[font.size[10], textColor(COLOR.text.neutral.med)]}
            numberOfLines={1}>
            {formatDateToHourMinute(new Date(message.createdAt), false)}
          </Text>
        </View>,
      ]}
      {isSystemMessage && (
        <View style={[padding.vertical.default]}>
          <View
            style={[
              background(COLOR.black[40], 0.2),
              padding.horizontal.medium,
              padding.vertical.default,
              rounded.medium,
            ]}>
            <Text
              style={[
                self.center,
                text.center,
                textColor(COLOR.text.neutral.high),
                font.size[10],
              ]}>
              {formatDateToHourMinute(new Date(message.createdAt), false)}
            </Text>
            <Text
              style={[
                self.center,
                text.center,
                textColor(COLOR.text.neutral.high),
                font.weight.medium,
                font.size[20],
              ]}>
              {message.message}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

interface BubbleContainerProps {
  isSender: boolean;
  isStart: boolean;
  isLast: boolean;
  children: ReactNode;
}

const BubbleContainer = ({...props}: BubbleContainerProps) => {
  const roundedSize: SizeType = 'large';
  return (
    <View
      style={[
        !props.isSender && [
          {
            borderTopRightRadius: size[roundedSize],
            borderBottomRightRadius: size[roundedSize],
          },
          background(COLOR.black[10], 0.5),
          props.isStart && [
            {
              borderTopLeftRadius: size[roundedSize],
            },
          ],
          props.isLast && [
            {
              borderBottomLeftRadius: size[roundedSize],
            },
          ],
        ],
        props.isSender && [
          {
            borderTopLeftRadius: size[roundedSize],
            borderBottomLeftRadius: size[roundedSize],
          },
          background(COLOR.green[10]),
          props.isStart && [
            {
              borderTopRightRadius: size[roundedSize],
            },
          ],
          props.isLast && [
            {
              borderBottomRightRadius: size[roundedSize],
            },
          ],
        ],
        props.isStart && props.isLast && [rounded[roundedSize]],
        {
          maxWidth: '70%',
        },
        padding.vertical.default,
        padding.horizontal.medium,
      ]}>
      {props.children}
    </View>
  );
};

export default ChatBubble;
