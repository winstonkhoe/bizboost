import {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setUser, switchRole} from '../redux/slices/userSlice';
import {
  BusinessPeople,
  ContentCreator,
  User,
  UserRole,
  UserRoles,
} from '../model/User';

export const useUser = () => {
  const {user, activeRole, uid} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const getData = (
    user: User | null,
    activeRole: UserRoles,
  ): ContentCreator | BusinessPeople | undefined => {
    if (!user) {
      return undefined;
    }
    if (activeRole === UserRole.ContentCreator) {
      return user?.contentCreator;
    } else if (activeRole === UserRole.BusinessPeople) {
      return user?.businessPeople;
    }
    return undefined;
  };
  const activeData: ContentCreator | BusinessPeople | undefined = getData(
    user,
    activeRole,
  );

  useEffect(() => {
    const updateUserState = (u: User | null) => {
      if (u) {
        dispatch(setUser(u.toJSON()));
        if (!activeRole && u.contentCreator?.fullname) {
          dispatch(switchRole(UserRole.ContentCreator));
        } else {
          dispatch(switchRole(UserRole.BusinessPeople));
        }
      }
    };
    if (!user && uid) {
      const unsubscribe = User.getUserDataReactive(uid, updateUserState);
      return unsubscribe;
    }
    if (user && !uid) {
      dispatch(setUser(null));
    }
  }, [user, uid, dispatch, activeRole]);
  return {uid, user, activeRole, activeData};
};
