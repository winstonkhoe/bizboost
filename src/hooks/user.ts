import {useCallback, useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setUser, switchRole} from '../redux/slices/userSlice';
import {BusinessPeople, ContentCreator, User, UserRole} from '../model/User';

export const useUser = () => {
  const unsubscribe = useRef<(() => void) | undefined>(undefined);
  const {user, activeRole, uid} = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  const getData = (
    user: User | null | undefined,
    activeRole?: UserRole,
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

  const updateUserRole = useCallback(
    (u: User) => {
      if (
        u.contentCreator?.fullname &&
        activeRole !== UserRole.ContentCreator
      ) {
        dispatch(switchRole(UserRole.ContentCreator));
      } else if (
        u.businessPeople?.fullname &&
        activeRole !== UserRole.BusinessPeople
      ) {
        dispatch(switchRole(UserRole.BusinessPeople));
      }
    },
    [dispatch, activeRole],
  );

  const updateUserState = useCallback(
    (u: User | null) => {
      if (u) {
        dispatch(setUser(u.toJSON()));
        updateUserRole(u);
      }
    },
    [dispatch, updateUserRole],
  );

  useEffect(() => {
    if (!user && uid) {
      const unsubscribeUserDataReactive = User.getUserDataReactive(
        uid,
        updateUserState,
        () => {
          if (uid) {
            User.signOut().then(() => {
              dispatch(setUser(null));
            });
          }
        },
      );
      unsubscribe.current = unsubscribeUserDataReactive;
    }

    return () => {
      if (!uid && unsubscribe.current) {
        unsubscribe.current();
        unsubscribe.current = undefined;
      }
    };
  }, [user, uid, dispatch, updateUserState]);

  useEffect(() => {
    if (!user || !uid) {
      if (activeRole) {
        dispatch(switchRole(undefined));
      }
    }
    if (user && uid && !activeRole) {
      updateUserRole(user);
    }
    if (user && !uid) {
      dispatch(setUser(null));
    }
  }, [user, uid, dispatch, updateUserRole, activeRole]);
  return {uid, user, activeRole, activeData};
};
