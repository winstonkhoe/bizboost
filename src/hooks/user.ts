import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setUser} from '../redux/slices/userSlice';
import {User} from '../model/User';

export const useUser = () => {
  const {user, activeRole, uid} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const updateUserState = (userCallback: User | null) => {
      if (userCallback) {
        dispatch(setUser(userCallback));
      }
    };
    if (!user && uid) {
      User.getUserData(uid, updateUserState);
    }
  }, [user, uid, dispatch]);
  return {uid, user, activeRole};
};
