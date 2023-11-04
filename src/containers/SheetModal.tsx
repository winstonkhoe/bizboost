import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {ReactNode, useCallback, useEffect, useRef} from 'react';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';

interface SheetModalProps {
  open: boolean;
  children: ReactNode;
  onDismiss?: () => void;
}

export const SheetModal = ({
  open = false,
  onDismiss,
  children,
}: SheetModalProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

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
      enableDynamicSizing
      enablePanDownToClose>
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheetModal>
  );
};
