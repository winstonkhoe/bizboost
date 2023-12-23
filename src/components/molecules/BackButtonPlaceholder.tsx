import {View} from 'react-native';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import CrossMarkThin from '../../assets/vectors/cross-mark-thin.svg';
import {COLOR} from '../../styles/Color';
import {flex, items, justify} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {
  AnimatedPressable,
  AnimatedPressableProps,
} from '../atoms/AnimatedPressable';
import {ChevronRight, CrossMarkIcon} from '../atoms/Icon';

export interface BackButtonPlaceholderProps
  extends Partial<AnimatedPressableProps> {
  icon?: 'back' | 'close';
}
export const BackButtonPlaceholder = ({
  icon = 'back',
  scale = 0.95,
  ...props
}: BackButtonPlaceholderProps) => {
  return (
    <View
      style={[
        flex.flex1,
        flex.flexRow,
        gap.default,
        items.center,
        justify.center,
      ]}>
      <AnimatedPressable {...props} scale={scale}>
        {icon === 'back' ? (
          <View className="rotate-180">
            <ChevronRight size="xlarge" strokeWidth={1.2} />
          </View>
        ) : (
          <CrossMarkIcon size="xlarge" />
        )}
      </AnimatedPressable>
    </View>
  );
};
