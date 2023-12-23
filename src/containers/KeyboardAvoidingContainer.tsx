import {ReactNode} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {flex} from '../styles/Flex';

interface Props {
  children: ReactNode;
  withoutScroll?: boolean;
}
export const KeyboardAvoidingContainer = ({
  children,
  withoutScroll = false,
}: Props) => {
  if (Platform.OS !== 'ios') {
    return children;
  }
  return withoutScroll ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={Platform.OS === 'ios'}
      style={[flex.flex1]}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <KeyboardAwareScrollView
      bounces={false}
      enableAutomaticScroll
      extraHeight={150}>
      {children}
    </KeyboardAwareScrollView>
  );
};
