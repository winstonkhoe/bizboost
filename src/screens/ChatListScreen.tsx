import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import {useUserChats} from '../hooks/chats';
import {useUser} from '../hooks/user'; // Import the hook for user information
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {getDate} from '../utils/date';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  RootAuthenticatedNavigationStackProps,
} from '../navigation/AuthenticatedNavigation';

const ChatListScreen = () => {
  const {uid} = useUser();
  const chats = useUserChats();

  const navigation = useNavigation<RootAuthenticatedNavigationStackProps>();

  console.log('Chat Objects:', chats.chats);

  return (
    <View style={flex.flexCol} className="bg-white">
      <Text className="text-2xl font-bold p-4">Chat List</Text>
      <ScrollView style={flex.flexCol}>
        {chats.chats.map((item, idx) => {
          const recipient = item.recipient;
          const chat = item.chat;

          if (!recipient) {
            return;
          }

          return (
            <TouchableWithoutFeedback
              key={idx}
              onPress={() => {
                navigation.navigate(AuthenticatedNavigation.ChatDetail, {
                  chat: item,
                });
              }}>
              <View
                style={flex.flexRow}
                className="flex flex-row items-center p-4 border-y border-gray-300 justify-between">
                <View className="w-12 h-full rounded-full overflow-hidden">
                  <Image
                    source={require('../assets/images/sample-influencer.jpeg')}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </View>
                {recipient.profilePicture && (
                  <Image
                    source={{uri: recipient.profilePicture}}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                )}
                <View className="h-full">
                  <Text className="text-lg font-bold">
                    {recipient.fullname || 'User'}
                  </Text>
                  <Text>
                    {chat.messages && chat.messages.length > 0
                      ? chat.messages[chat.messages.length - 1].message
                      : 'No messages'}
                  </Text>
                </View>
                {chat.messages && chat.messages.length > 0 && (
                  <View className="flex h-full">
                    <Text>
                      {chat.messages.length > 0 &&
                      chat.messages[chat.messages.length - 1].createdAt
                        ? getDate(
                            chat.messages[chat.messages.length - 1].createdAt,
                          ).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No timestamp available'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ChatListScreen;
