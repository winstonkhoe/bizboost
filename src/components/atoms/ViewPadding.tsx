import {View} from 'react-native';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {SizeType} from '../../styles/Size';

interface Props extends React.PropsWithChildren {
  paddingSize?: SizeType;
}

const HorizontalPadding = ({paddingSize = 'default', children}: Props) => {
  return <View style={[horizontalPadding[paddingSize]]}>{children}</View>;
};

const VerticalPadding = ({paddingSize = 'default', children}: Props) => {
  return <View style={[verticalPadding[paddingSize]]}>{children}</View>;
};

export {HorizontalPadding, VerticalPadding};
