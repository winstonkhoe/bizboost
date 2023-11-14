import {Pressable, PressableProps, View} from 'react-native';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import CrossMarkThin from '../../assets/vectors/cross-mark-thin.svg';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';

interface Props extends PressableProps {
  icon?: 'back' | 'close';
}
export const BackButtonPlaceholder = ({icon = 'back', ...props}: Props) => {
  return (
    <View
      style={[
        flex.flex1,
        flex.flexRow,
        gap.default,
        items.center,
        justify.center,
      ]}>
      <Pressable {...props}>
        {icon === 'back' ? (
          <ChevronLeft width={25} height={25} color={COLOR.black[100]} />
        ) : (
          <CrossMarkThin width={30} height={30} color={COLOR.black[100]} />
        )}
      </Pressable>
    </View>
  );
};
