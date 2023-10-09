import {ReactNode} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
type Props = {
  children: ReactNode;
};
const SafeAreaContainer = ({children}: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="bg-white/50"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {children}
    </View>
  );
};

export default SafeAreaContainer;
