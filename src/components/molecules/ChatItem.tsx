import React, {useEffect, useState} from 'react';
import {Pressable, View, Text} from 'react-native';
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
import { getTimeAgo } from '../../utils/date';

interface ChatItemProps {
  chat: Chat;
}

const ChatItem = ({chat}: ChatItemProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {isBusinessPeople, isContentCreator} = useUser();

  const profilePictureSource = require('../../assets/images/sample-influencer.jpeg');
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

  console.log('role:' + isBusinessPeople + ' rec:' + JSON.stringify(recipient));
  console.log('chat:' + chat);

  return (
    <Pressable
      onPress={() => {
        if (recipient) {
          navigation.navigate(AuthenticatedNavigation.ChatDetail, {
            chat: chat,
            recipient: recipient,
          });
        }
      }}>
      <View className="flex flex-row items-center p-4 border-y border-gray-300">
        <View style={gap.default} className="flex flex-row h-full">
          <View
            className="overflow-hidden"
            style={[dimension.square.xlarge2, rounded.max]}>
            <FastImage
              style={[dimension.full]}
              source={getSourceOrDefaultAvatar({
                uri: recipient?.profilePicture,
              })}
            />
          </View>
          <View className="h-full">
            <Text className="text-lg font-bold">
              {recipient ? recipient.fullname : 'User'}
            </Text>
            <Text numberOfLines={1} className="w-[70vw]">
              {chat.messages && chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1].message
                : ''}
            </Text>
          </View>
        </View>
        {chat.messages && chat.messages.length > 0 && (
          <View>
            <Text>
              {chat.messages.length > 0 &&
              chat.messages[chat.messages.length - 1].createdAt
                ? getTimeAgo(
                    chat.messages[chat.messages.length - 1].createdAt || 0,
                  )
                : ''}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ChatItem;
