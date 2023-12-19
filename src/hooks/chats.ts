import {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Chat} from '../model/Chat';
import {setUserChats} from '../redux/slices/chatSlice';

export const useUserChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const {uid, activeRole} = useAppSelector(state => state.user);
  const {userChats} = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid && activeRole) {
      return Chat.getUserChatsReactive(uid, activeRole, setChats);
    }
  }, [uid, activeRole, dispatch]);

  useEffect(() => {
    if (chats.length > 0 && activeRole) {
      Promise.allSettled(chats.map(ch => ch.serialize()))
        .then(results => {
          console.log('useUserChats.all settled results', results);
          const fulfilledChats = results
            .filter(
              (result): result is PromiseFulfilledResult<Chat> =>
                result.status === 'fulfilled',
            )
            .map(result => result.value);
          dispatch(setUserChats(fulfilledChats));
        })
        .catch(err => console.log('useUserChats error: ' + err));
    }
  }, [chats, activeRole, dispatch]);

  return {chats: userChats};
};
