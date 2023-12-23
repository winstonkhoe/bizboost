import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {Chat} from '../model/Chat';
import {setUserChats} from '../redux/slices/chatSlice';

export const useUserChats = () => {
  const {uid, activeRole} = useAppSelector(state => state.user);
  const {userChats} = useAppSelector(state => state.chat);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (uid && activeRole) {
      return Chat.getUserChatsReactive(uid, activeRole, c => {
        dispatch(setUserChats(c.map(_ => _.serialize())));
      });
    }
  }, [uid, activeRole, dispatch]);

  return {chats: userChats};
};
