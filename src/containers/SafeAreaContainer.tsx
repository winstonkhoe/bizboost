import {ReactNode} from 'react';
import {View} from 'react-native';
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
  return (
    <View
      style={[
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        background(COLOR.background.light),
      ]}>
      {children}
    </View>
  );
};

export default SafeAreaContainer;
