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

export const SwitchUserModalProvider = () => {
  const dispatch = useAppDispatch();
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
        style={[
          props.style,
          background(COLOR.black),
          {
            opacity: 1,
          },
        ]}
      />
    ),
    [],
  );
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onDismiss={() => dispatch(closeModal())}
        backdropComponent={renderBackdrop}
        enableDynamicSizing
        enablePanDownToClose>
        <BottomSheetView>
          <HorizontalPadding>
            <View className="pt-2 pb-6" style={[flex.flexCol, gap.default]}>
              <AccountListCard name="DavidCoderz" active={true} role="CC" />
              <AccountListCard name="kodetime" active={false} role="BP" />
            </View>
          </HorizontalPadding>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};
