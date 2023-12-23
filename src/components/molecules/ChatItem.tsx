import React, {useEffect, useState} from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import {Chat, Recipient} from '../../model/Chat';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {User} from '../../model/User';
import {useUser} from '../../hooks/user';
import {gap} from '../../styles/Gap';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {formatDateToHourMinute} from '../../utils/date';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {flex, items} from '../../styles/Flex';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {overflow} from '../../styles/Overflow';

interface ChatItemProps {
  chat: Chat;
}

const ChatItem = ({chat}: ChatItemProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {isBusinessPeople, isContentCreator} = useUser();
  const [recipient, setRecipient] = useState<Recipient>();

  useEffect(() => {
    if (isBusinessPeople) {
      if (chat.contentCreatorId) {
        User.getById(chat.contentCreatorId || '').then(u =>
          setRecipient({
            fullname: u?.contentCreator?.fullname || '',
            profilePicture: u?.contentCreator?.profilePicture || '',
          }),
        );
      }
    }
    if (isContentCreator) {
      if (chat.businessPeopleId) {
        User.getById(chat.businessPeopleId || '').then(u =>
          setRecipient({
            fullname: u?.businessPeople?.fullname || '',
            profilePicture: u?.businessPeople?.profilePicture || '',
          }),
        );
      }
    }
  }, [isBusinessPeople, isContentCreator, chat]);

  return (
    <Pressable
      onPress={() => {
        if (recipient) {
          navigation.navigate(AuthenticatedNavigation.ChatDetail, {
            chatId: chat.id,
          });
        }
      }}>
      <View
        style={[
          flex.flexRow,
          items.center,
          styles.borderHorizontal,
          padding.default,
          gap.default,
        ]}>
        <View style={[dimension.square.xlarge2, rounded.max, overflow.hidden]}>
          <FastImage
            style={[dimension.full]}
            source={getSourceOrDefaultAvatar({
              uri: recipient?.profilePicture,
            })}
          />
        </View>
        <View style={[flex.flex1]}>
          <Text
            style={[
              font.size[30],
              font.weight.medium,
              textColor(COLOR.text.neutral.high),
            ]}>
            {recipient ? recipient.fullname : 'User'}
          </Text>
          <Text
            numberOfLines={1}
            style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            {chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1].message
              : ''}
          </Text>
        </View>
        {chat.messages && chat.messages.length > 0 && (
          <View>
            {chat.messages.length > 0 &&
              chat.messages[chat.messages.length - 1].createdAt && (
                <Text
                  style={[font.size[10], textColor(COLOR.text.neutral.med)]}>
                  {formatDateToHourMinute(
                    new Date(chat.messages[chat.messages.length - 1].createdAt),
                  )}
                </Text>
              )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  borderHorizontal: {
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLOR.black[20],
  },
});

export default ChatItem;
