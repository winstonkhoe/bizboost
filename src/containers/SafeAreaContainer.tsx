import {ReactNode} from 'react';
import {View} from 'react-native';
import {EdgeInsets, useSafeAreaInsets} from 'react-native-safe-area-context';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {size} from '../styles/Size';
type Props = {
  children: ReactNode;
  customInsets?: Partial<EdgeInsets>;
  enable?: boolean;
};
const SafeAreaContainer = ({children, enable = false, customInsets}: Props) => {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {...safeAreaInsets, ...customInsets};
  return (
    <View
      className="flex-1"
      style={[
        enable && {
          paddingTop: Math.max(insets.top, size.default),
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: Math.max(insets.bottom, size.small),
        },
        background(COLOR.background.neutral.default),
      ]}>
      {children}
    </View>
  );
};

export default SafeAreaContainer;
