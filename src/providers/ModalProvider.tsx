import {View} from 'react-native';
import {AccountListCard} from '../components/molecules/AccountListCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {closeModal} from '../redux/slices/modalSlice';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {useUser} from '../hooks/user';
import {BusinessPeople, ContentCreator, User, UserRole} from '../model/User';
import {SheetModal} from '../containers/SheetModal';
import {padding} from '../styles/Padding';

export const SwitchUserModalProvider = () => {
  const dispatch = useAppDispatch();
  const {user, activeRole} = useUser();
  const modalOpenState = useAppSelector(state => state.modal.isOpen);

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
  const getAnotherRole = (role?: UserRole) => {
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
        <View
          style={[
            flex.flexCol,
            gap.default,
            padding.top.default,
            padding.bottom.medium,
          ]}>
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
