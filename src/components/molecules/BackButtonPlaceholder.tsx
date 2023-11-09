import {Pressable, PressableProps, View} from 'react-native';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import CrossMarkThin from '../../assets/vectors/cross-mark-thin.svg';
import {COLOR} from '../../styles/Color';
import {ReactNode} from 'react';
import {flex} from '../../styles/Flex';
import {gap} from '../../styles/Gap';

interface Props extends PressableProps {
  children?: ReactNode;
  icon?: 'back' | 'close';
}
export const BackButtonPlaceholder = ({
  children,
  icon = 'back',
  ...props
}: Props) => {
  return (
    <View className="items-center" style={[flex.flexRow, gap.default]}>
      <Pressable {...props}>
        {icon === 'back' ? (
          <ChevronLeft width={25} height={25} color={COLOR.black[100]} />
        ) : (
          <CrossMarkThin width={30} height={30} color={COLOR.black[100]} />
        )}
      </Pressable>
      <View className="flex-1" style={[flex.flexRow]}>
        {children}
      </View>
    </View>
  );
};
