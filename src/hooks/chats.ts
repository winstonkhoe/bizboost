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
              console.log('[chats.ts hook] chat:' + chat.id);

              const cv: ChatView = {
                chat: Chat.serialize(chat),
                recipient: {},
              };

              for (const participant of chat.participants || []) {
                if (participant.ref != uid) {
                  console.log('[chats.ts hook] participant:' + participant.ref);
                  const role = participant.role;
                  const ref = participant.ref;
                  console.log(ref);

                  const user = await User.getUser(ref);
                  if (user) {
                    const fullname =
                      role === 'Business People'
                        ? user.businessPeople?.fullname
                        : user.contentCreator?.fullname;
                    const profilePicture =
                      role === 'Business People'
                        ? user.businessPeople?.profilePicture
                        : user.contentCreator?.profilePicture;

                    if (cv.recipient) {
                      cv.recipient.fullname = fullname;
                      cv.recipient.profilePicture = profilePicture;
                    }
                  }
                }
              }

              return cv;
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
