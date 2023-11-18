import {
  BottomSheetBackdrop,
  BottomSheetModal,
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

interface SheetModalProps {
  open: boolean;
  fullHeight?: boolean;
  children: ReactNode;
  bottomInsetType?: 'auto' | 'default' | 'padding';
  maxHeight?: number;
  onDismiss?: () => void;
}

const safeKeyboardOffset = 10;

export const SheetModal = ({
  open = false,
  fullHeight = false,
  onDismiss,
  maxHeight,
  children,
  bottomInsetType = 'auto',
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
      bottomInset={
        ((bottomInsetType === 'auto' &&
          currentLayoutHeight >= keyboardHeight - safeKeyboardOffset) ||
          bottomInsetType === 'default') &&
        Platform.OS !== 'android'
          ? keyboardHeight
          : undefined
      }
      // snapPoints={[fullHeight ? '100%' : '50%', '100%']}
      enableDynamicSizing
      enablePanDownToClose>
      <BottomSheetView
        style={[
          fullHeight && flex.flex1,
          {
            minHeight: keyboardHeight,
          },
        ]}>
        <View
          onLayout={e => {
            setCurrentLayoutHeight(e.nativeEvent.layout.height);
          }}>
          {children}
        </View>
        {((bottomInsetType === 'auto' &&
          currentLayoutHeight < keyboardHeight - safeKeyboardOffset) ||
          bottomInsetType === 'padding') && (
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
