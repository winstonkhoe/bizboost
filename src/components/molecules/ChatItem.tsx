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

interface ChatItemProps {
  chat: Chat;
}

const ChatItem = ({chat}: ChatItemProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {isBusinessPeople} = useUser();

  const profilePictureSource = require('../../assets/images/sample-influencer.jpeg');
  const [recipient, setRecipient] = useState<Recipient>();

  useEffect(() => {
    if (isBusinessPeople) {
      User.getById(chat.contentCreatorId || '').then(u =>
        setRecipient({
          fullname: u?.contentCreator?.fullname || '',
          profilePicture: u?.contentCreator?.profilePicture || '',
        }),
      );
    } else {
      User.getById(chat.businessPeopleId || '').then(u =>
        setRecipient({
          fullname: u?.businessPeople?.fullname || '',
          profilePicture: u?.businessPeople?.profilePicture || '',
        }),
      );
    }
  }, [isBusinessPeople]);

  console.log('role:' + isBusinessPeople + ' rec:' + JSON.stringify(recipient));

  return (
    <Pressable
      onPress={() => {
        navigation.navigate(AuthenticatedNavigation.ChatDetail, {
          chat: chat,
          recipient: recipient,
        });
      }}>
      <View className="flex flex-row items-center p-4 border-y border-gray-300 justify-between">
        <View style={gap.default} className="flex flex-row h-full">
          <View className="w-12 h-12 rounded-full overflow-hidden">
            <FastImage
              source={
                recipient?.profilePicture
                  ? {
                      uri: recipient?.profilePicture,
                    }
                  : profilePictureSource
              }
              className="w-full h-full object-cover"
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
          <View className="flex h-full">
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
