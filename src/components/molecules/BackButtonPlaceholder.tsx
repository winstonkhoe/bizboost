import {Pressable, PressableProps, View} from 'react-native';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import {COLOR} from '../../styles/Color';
import {ReactNode} from 'react';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';

interface Props extends PressableProps {
  children?: ReactNode;
}
export const BackButtonPlaceholder = ({children, ...props}: Props) => {
  return (
    <View className="items-center" style={[flex.flexRow, gap.default]}>
      <Pressable {...props}>
        <ChevronLeft width={25} height={25} color={COLOR.black[100]} />
      </Pressable>
      <View className="flex-1" style={[flex.flexRow]}>
        {children}
      </View>
    </View>
  );
};
