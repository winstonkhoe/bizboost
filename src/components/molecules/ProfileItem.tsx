import {Pressable, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import Search from '../../assets/vectors/search.svg';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {textColor} from '../../styles/Text';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';

interface Props {
  itemLabel: string;
  itemAdditionalInfo?: string;
}

export const ProfileItem = ({itemLabel, itemAdditionalInfo}: Props) => {
  return (
    <Pressable
      className="w-full border-t items-center"
      style={[
        flex.flexRow,
        gap.medium,
        verticalPadding.small,
        horizontalPadding.default,
        border({
          color: COLOR.black[100],
          opacity: 0.3,
        }),
      ]}>
      <View
        className="items-center p-2"
        style={[flex.flexRow, background(COLOR.black[100], 0.1), rounded.max]}>
        <Search width={14} height={14} />
      </View>
      <View className="flex-1 items-start" style={[flex.flexCol]}>
        <Text className="font-bold text-sm">{itemLabel}</Text>
        {itemAdditionalInfo && (
          <Text
            className="text-xs font-light"
            style={[textColor(COLOR.black[100], 0.5)]}>
            {itemAdditionalInfo}
          </Text>
        )}
      </View>
      <Pressable className="rotate-180">
        <ChevronLeft width={14} height={14} color={COLOR.black[100]} />
      </Pressable>
    </Pressable>
  );
};
