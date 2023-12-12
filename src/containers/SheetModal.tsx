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
  bottomInsetType?: 'auto' | 'default' | 'padding';
  maxHeight?: number;
  onDismiss?: () => void;
  disableCloseOnClickBackground?: boolean;
  disablePanDownToClose?: boolean;
}

const safeKeyboardOffset = 10;

export const SheetModal = ({
  open = false,
  fullHeight = false,
  onDismiss,
  maxHeight,
  children,
  bottomInsetType = 'auto',
  disableCloseOnClickBackground = false,
  disablePanDownToClose = false,
  snapPoints,
  ...props
}: SheetModalProps) => {
  const keyboardHeight = useKeyboard();
  const [currentLayoutHeight, setCurrentLayoutHeight] = useState(0);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const windowDimensions = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={disableCloseOnClickBackground ? 'none' : 'close'}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, background(COLOR.black[100])]}
      />
    ),
    [disableCloseOnClickBackground],
  );

  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present();
      return;
    }
    bottomSheetModalRef.current?.close();
  }, [open]);

  useEffect(() => {
    console.log(
      'currentLayoutHeight y',
      currentLayoutHeight,
      'currentWindowHeight',
      windowDimensions.height,
    );
  }, [currentLayoutHeight, windowDimensions]);

  return (
    <BottomSheetModal
      {...props}
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
        ((bottomInsetType === 'auto' &&
          currentLayoutHeight >= keyboardHeight - safeKeyboardOffset) ||
          bottomInsetType === 'default') &&
        Platform.OS !== 'android'
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
        <View
          style={[fullHeight && flex.flex1]}
          onLayout={e => {
            const height = e.nativeEvent.layout.height;
            if (currentLayoutHeight !== height) {
              setCurrentLayoutHeight(height);
            }
          }}>
          {children}
        </View>
        {((bottomInsetType === 'auto' &&
          currentLayoutHeight < keyboardHeight - safeKeyboardOffset) ||
          bottomInsetType === 'padding') &&
          Platform.OS !== 'android' && (
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
