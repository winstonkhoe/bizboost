import {ReactNode} from 'react';
import {Platform, View} from 'react-native';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
type Props = {
  children: ReactNode;
  customInsets?: Partial<EdgeInsets>;
};
const SafeAreaContainer = ({children, customInsets}: Props) => {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {...safeAreaInsets, ...customInsets};
  const additionalOffset = Platform.OS === 'android' ? 15 : 0;
  return (
    <View
      className="flex-1"
      style={[
        {
          paddingTop: insets.top + additionalOffset,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        },
        background(COLOR.background.light),
      ]}>
      {children}
    </View>
  );
};

export default SafeAreaContainer;
