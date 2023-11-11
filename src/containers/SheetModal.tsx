import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {ReactNode, useCallback, useEffect, useRef} from 'react';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface SheetModalProps {
  open: boolean;
  children: ReactNode;
  maxHeight?: number;
  onDismiss?: () => void;
}

export const SheetModal = ({
  open = false,
  onDismiss,
  maxHeight,
  children,
}: SheetModalProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const windowDimensions = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, background(COLOR.black[100])]}
      />
    ),
    [],
  );

  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present();
      return;
    }
    bottomSheetModalRef.current?.close();
  }, [open]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      maxDynamicContentSize={
        maxHeight
          ? maxHeight
          : windowDimensions.height - (safeAreaInsets.top + 30)
      }
      enableDynamicSizing
      enablePanDownToClose>
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheetModal>
  );
};
