import React, {Text, TouchableOpacity, View} from 'react-native';
import {useUserChats} from '../hooks/chats';
import {useUser} from '../hooks/user';
import {User} from '../model/User';
import {useEffect, useState} from 'react';

const ChatsScreen = () => {
  const chats = useUserChats();
  console.log(chats);

  const {uid, activeRole} = useUser();

  // const [recipientNames, setRecipientNames] = useState({});

  // Fetch recipient names for all chats
  chats.chats.forEach(c => {
    c.participants?.forEach(p => {
      console.log(p);
    });
  });

  return;
};

export default ChatsScreen;
