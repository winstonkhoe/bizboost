import {View} from 'react-native';
import {
  PaddingSizeType,
  horizontalPadding,
  verticalPadding,
} from '../../styles/Padding';

interface Props extends React.PropsWithChildren {
  paddingSize?: PaddingSizeType;
}

const HorizontalPadding = ({paddingSize = 'default', children}: Props) => {
  return (
    <View className="w-full" style={[horizontalPadding[paddingSize]]}>
      {children}
    </View>
  );
};

const VerticalPadding = ({paddingSize = 'default', children}: Props) => {
  return (
    <View className="w-full" style={[verticalPadding[paddingSize]]}>
      {children}
    </View>
  );
};

export {HorizontalPadding, VerticalPadding};
