import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Chat} from '../model/Chat';
import {setUserChats} from '../redux/slices/chatSlice';

export const useUserChats = () => {
  const {uid, activeRole} = useAppSelector(state => state.user);
  const {userChats} = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid) {
      Chat.getUserChatsReactive(
        uid,
        activeRole,
        (chats: Chat[], unsubscribe: () => void) => {
          const serializedChats = chats.map(chat => {
            const serializedMessages = chat.messages?.map(message => ({
              message: message.message,
              type: message.type,
              sender: message.sender,
              createdAt: message.createdAt.toString(),
            }));

            return {
              id: chat.id,
              participants: chat.participants,
              messages: serializedMessages,
            };
          });
          dispatch(setUserChats(serializedChats));
          return unsubscribe;
        },
      );
    }
  }, [uid, activeRole, dispatch]);

  return {chats: userChats};
};
