import {ReactNode} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface Props {
  children: ReactNode;
  withoutScroll?: boolean;
}
export const KeyboardAvoidingContainer = ({
  children,
  withoutScroll = false,
}: Props) => {
  return withoutScroll ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={Platform.OS === 'ios'}
      style={styles.container}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <KeyboardAwareScrollView>{children}</KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
