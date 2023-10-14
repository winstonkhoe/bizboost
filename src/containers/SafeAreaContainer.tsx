import {ReactNode} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
type Props = {
  children: ReactNode;
};
const SafeAreaContainer = ({children}: Props) => {
  const insets = useSafeAreaInsets();
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
