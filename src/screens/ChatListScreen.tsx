import React from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {useUserChats} from '../hooks/chats';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {getTimeAgo} from '../utils/date';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';

const ChatListScreen = () => {
  const chats = useUserChats();

  const navigation = useNavigation<NavigationStackProps>();

  const profilePictureSource = require('../assets/images/sample-influencer.jpeg');

  return (
    <SafeAreaContainer enable>
      <View style={[flex.flex1, flex.flexCol, gap.default, padding.top.medium]}>
        <View style={[padding.horizontal.medium]}>
          <Text
            className="font-bold"
            style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
            Chats
          </Text>
        </View>
        <ScrollView style={[flex.flex1, flex.flexCol]}>
          {chats.chats ? (
            chats.chats.map((item, idx) => {
              const recipient = item.recipient;
              const chat = item.chat;

              return !recipient ? null : (
                <Pressable
                  key={idx}
                  onPress={() => {
                    navigation.navigate(AuthenticatedNavigation.ChatDetail, {
                      chat: item,
                    });
                  }}>
                  <View className="flex flex-row items-center p-4 border-y border-gray-300 justify-between">
                    <View style={gap.medium} className="flex flex-row h-full">
                      <View className="w-12 h-12 rounded-full overflow-hidden">
                        <FastImage
                          source={
                            item.recipient?.profilePicture
                              ? {
                                  uri: item.recipient?.profilePicture,
                                }
                              : profilePictureSource
                          }
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
                            ? getTimeAgo(
                                chat.messages[chat.messages.length - 1]
                                  .createdAt || 0,
                              )
                            : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
          ) : (
            <View
              style={flex.flexCol}
              className="px-4 py-32 justify-center items-center">
              <FastImage
                source={{
                  uri: 'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default%2Fempty-chat.png?alt=media&token=eff938c9-35e5-4b45-9ec9-cd4600d1c14e&_gl=1*9utvv8*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5OTQ1NzkxMy42MS4xLjE2OTk0NTgwMTAuMzEuMC4w',
                }}
                style={[
                  {
                    width: 300,
                    height: 300,
                  },
                ]}
              />
              <Text className="text-black">No chat available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaContainer>
  );
};

export default ChatListScreen;
