import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Chat, ChatView, Participant} from '../model/Chat';
import {setUserChats} from '../redux/slices/chatSlice';
import {User} from '../model/User';

export const useUserChats = () => {
  const {uid, activeRole} = useAppSelector(state => state.user);
  const {userChats} = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid) {
      Chat.getUserChatsReactive(
        uid,
        activeRole,
        async (chats: Chat[], unsubscribe: () => void) => {
          const updatedChats = await Promise.all(
            chats.map(async chat => {
              return await chat.convertToChatView(activeRole);
            }),
          );

          dispatch(setUserChats(updatedChats));
          return unsubscribe;
        },
      );
    }
  }, [uid, activeRole, dispatch]);

  return {chats: userChats};
};
