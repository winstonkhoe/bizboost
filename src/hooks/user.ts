import {useCallback, useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setUser, switchRole} from '../redux/slices/userSlice';
import {
  BusinessPeople,
  ContentCreator,
  User,
  UserRole,
  UserStatus,
} from '../model/User';
import {showToast} from '../helpers/toast';
import {ToastType} from '../providers/ToastProvider';

export const useUser = () => {
  const unsubscribe = useRef<(() => void) | undefined>(undefined);
  const {user, activeRole, uid, isAdmin, isBusinessPeople, isContentCreator} =
    useAppSelector(state => state.user);
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

  const updateUserState = useCallback(
    (u: User | null) => {
      if (u) {
        if (u?.status === UserStatus.Active) {
          dispatch(setUser(u.toJSON()));
        } else {
          dispatch(setUser(null));
          showToast({
            message: 'Login failed! Your account has been suspended.',
            type: ToastType.danger,
          });
        }
      }
    },
    [dispatch],
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
    if (user && !uid) {
      dispatch(setUser(null));
    }
  }, [user, uid, dispatch, activeRole]);
  return {
    uid,
    user,
    activeRole,
    activeData,
    isAdmin,
    isBusinessPeople,
    isContentCreator,
  };
};
