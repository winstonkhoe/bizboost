import React from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
import {useUserChats} from '../hooks/chats';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {getTimeAgo} from '../utils/date';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import ChatItem from '../components/molecules/ChatItem';
import {LoadingScreen} from './LoadingScreen';

const ChatListScreen = () => {
  const chats = useUserChats();

  if (chats.chats === undefined) {
    return <LoadingScreen />;
  }

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
          {chats.chats.length > 0 ? (
            chats.chats.map(item => {
              return <ChatItem key={item.id} chat={item} />;
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
