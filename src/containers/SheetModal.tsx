import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {ReactNode, useCallback, useEffect, useRef, useState} from 'react';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {Platform, useWindowDimensions} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {flex} from '../styles/Flex';
import {useKeyboard} from '../hooks/keyboard';
import {View} from 'react-native';

interface SheetModalProps extends Partial<BottomSheetModalProps> {
  open: boolean;
  fullHeight?: boolean;
  children: ReactNode;
  bottomInsetType?: 'default' | 'padding';
  maxHeight?: number;
  onDismiss?: () => void;
  disableCloseOnClickBackground?: boolean;
  disablePanDownToClose?: boolean;
}

export const SheetModal = ({
  open = false,
  fullHeight = false,
  onDismiss,
  maxHeight,
  children,
  bottomInsetType = 'default',
  disableCloseOnClickBackground = false,
  disablePanDownToClose = false,
  snapPoints,
  ...props
}: SheetModalProps) => {
  const keyboardHeight = useKeyboard();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const windowDimensions = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={disableCloseOnClickBackground ? 'none' : 'close'}
        disappearsOnIndex={-1}
        opacity={0.7}
        style={[props.style, background(COLOR.absoluteBlack[100])]}
      />
    ),
    [disableCloseOnClickBackground],
  );

  useEffect(() => {
    console.log('sheetmodal open or close value:', open);
    if (open) {
      bottomSheetModalRef.current?.present();
      return;
    }
    bottomSheetModalRef.current?.close();
  }, [open]);

  return (
    <BottomSheetModal
      {...props}
      backgroundStyle={[background(COLOR.background.neutral.default)]}
      handleIndicatorStyle={[background(COLOR.black[20])]}
      ref={bottomSheetModalRef}
      onDismiss={onDismiss}
      backdropComponent={renderBackdrop}
      maxDynamicContentSize={
        maxHeight
          ? maxHeight
          : windowDimensions.height -
            (safeAreaInsets.top + 30 + Platform.OS === 'android'
              ? keyboardHeight
              : 0)
      }
      topInset={safeAreaInsets.top}
      bottomInset={
        bottomInsetType === 'default' && Platform.OS !== 'android'
          ? keyboardHeight
          : undefined
      }
      snapPoints={snapPoints}
      handleComponent={disablePanDownToClose ? null : undefined}
      enableDynamicSizing={props.enableDynamicSizing ?? true}
      enablePanDownToClose={!disablePanDownToClose}>
      <BottomSheetView
        style={[
          fullHeight && flex.flex1,
          {
            minHeight: keyboardHeight,
          },
        ]}>
        <View style={[fullHeight && flex.flex1]}>{children}</View>
        {bottomInsetType === 'padding' && Platform.OS !== 'android' && (
          <View
            style={[
              {
                paddingBottom: keyboardHeight,
              },
            ]}
          />
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
};
