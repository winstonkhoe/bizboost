import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setUser} from '../redux/slices/userSlice';
import {User} from '../model/User';

export const useUser = () => {
  const {user, activeRole, uid} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const updateUserState = (u: User | null, unsubscribe: () => void) => {
      if (u) {
        dispatch(setUser(u.toJSON()));
        return unsubscribe;
      }
    };
    if (!user && uid) {
      User.getUserDataReactive(uid, updateUserState);
    }
  }, [user, uid, dispatch]);
  return {uid, user, activeRole};
};
