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
  NavigationStackProps,
} from '../navigation/StackNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';

const ChatListScreen = () => {
  const {uid} = useUser();
  const chats = useUserChats();

  const navigation = useNavigation<NavigationStackProps>();

  console.log('Chat Objects:', chats.chats);

  return (
    <SafeAreaContainer>
      <View style={flex.flexCol} className="bg-white">
        <Text className="text-2xl font-bold p-4">Chat List</Text>
        <ScrollView style={flex.flexCol}>
          {chats.chats ? (
            chats.chats.map((item, idx) => {
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
                  <View className="flex flex-row items-center p-4 border-y border-gray-300 justify-between">
                    <View style={gap.medium} className="flex flex-row h-full">
                      <View className="w-12 h-full rounded-full overflow-hidden">
                        <Image
                          source={require('../assets/images/sample-influencer.jpeg')}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </View>
                      <View className="h-full">
                        <Text className="text-lg font-bold">
                          {recipient.fullname || 'User'}
                        </Text>
                        <Text>
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
                            ? getDate(
                                chat.messages[chat.messages.length - 1]
                                  .createdAt,
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
            })
          ) : (
            <View
              style={flex.flexCol}
              className="px-4 py-32 justify-center items-center">
              <Image
                source={{
                  uri: 'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default%2Fempty-chat.png?alt=media&token=eff938c9-35e5-4b45-9ec9-cd4600d1c14e&_gl=1*9utvv8*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5OTQ1NzkxMy42MS4xLjE2OTk0NTgwMTAuMzEuMC4w',
                }}
                width={300}
                height={300}
                alt="Default No Chat"
              />
              <Text>No chat available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaContainer>
  );
};

export default ChatListScreen;
