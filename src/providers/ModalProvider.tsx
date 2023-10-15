import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {View} from 'react-native';
import {AccountListCard} from '../components/molecules/AccountListCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {useCallback, useEffect, useRef} from 'react';
import {closeModal} from '../redux/slices/modalSlice';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {useUser} from '../hooks/user';
import {User, UserRole, UserRoles} from '../model/User';

export const SwitchUserModalProvider = () => {
  const dispatch = useAppDispatch();
  const {user, activeRole} = useUser();
  const modalOpenState = useAppSelector(state => state.modal.isOpen);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    if (modalOpenState) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.close();
    }
  }, [modalOpenState]);
  useEffect(() => {
    bottomSheetModalRef.current?.close();
  }, []);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, background(COLOR.black)]}
      />
    ),
    [],
  );
  const getUserName = (user: User, activeRole: UserRoles) => {
    if (activeRole === UserRole.ContentCreator) {
      return user?.contentCreator?.fullname;
    } else if (activeRole === UserRole.BusinessPeople) {
      return user?.businessPeople?.fullname;
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
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onDismiss={() => dispatch(closeModal())}
      backdropComponent={renderBackdrop}
      enableDynamicSizing
      enablePanDownToClose>
      <BottomSheetView>
        <HorizontalPadding>
          <View className="pt-2 pb-6" style={[flex.flexCol, gap.default]}>
            <AccountListCard
              name={user && getUserName(user, activeRole)}
              active
              role={activeRole}
            />
            <AccountListCard
              name={
                user &&
                getAnotherRole(activeRole) &&
                getUserName(user, getAnotherRole(activeRole))
              }
              role={getAnotherRole(activeRole)}
            />
          </View>
        </HorizontalPadding>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
