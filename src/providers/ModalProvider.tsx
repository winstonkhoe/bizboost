import {View} from 'react-native';
import {AccountListCard} from '../components/molecules/AccountListCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {closeModal} from '../redux/slices/modalSlice';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {useUser} from '../hooks/user';
import {
  BusinessPeople,
  ContentCreator,
  User,
  UserRole,
  UserRoles,
} from '../model/User';
import {SheetModal} from '../containers/SheetModal';

export const SwitchUserModalProvider = () => {
  const dispatch = useAppDispatch();
  const {user, activeRole} = useUser();
  const modalOpenState = useAppSelector(state => state.modal.isOpen);

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
  const getAnotherRole = (role: UserRoles) => {
    if (role === UserRole.ContentCreator) {
      return UserRole.BusinessPeople;
    } else if (role === UserRole.BusinessPeople) {
      return UserRole.ContentCreator;
    }
    return undefined;
  };
  return (
    <SheetModal open={modalOpenState} onDismiss={() => dispatch(closeModal())}>
      <HorizontalPadding>
        <View className="pt-2 pb-6" style={[flex.flexCol, gap.default]}>
          <AccountListCard
            data={getData(user, activeRole)}
            active
            role={activeRole}
          />
          <AccountListCard
            data={
              getAnotherRole(activeRole) &&
              getData(user, getAnotherRole(activeRole))
            }
            role={getAnotherRole(activeRole)}
          />
        </View>
      </HorizontalPadding>
    </SheetModal>
  );
};
