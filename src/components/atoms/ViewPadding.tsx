import {View} from 'react-native';

const HorizontalPadding = ({children}: React.PropsWithChildren) => {
  return <View className="w-full px-4">{children}</View>;
};

export {HorizontalPadding};
