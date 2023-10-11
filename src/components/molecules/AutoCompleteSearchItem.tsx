import {Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import Search from '../../assets/vectors/search.svg';
import DiagonalArrow from '../../assets/vectors/diagonal-arrow.svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import {useAppSelector} from '../../redux/hooks';

interface Props {
  itemValue: string;
}

const AutoCompleteSearchItem = ({itemValue}: Props) => {
  const {searchTerm} = useAppSelector(state => state.search);
  const regEscape = (v: string) =>
    v.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  const splittedItemValues = itemValue.split(
    new RegExp(regEscape(searchTerm), 'ig'),
  );
  return (
    <View
      className="w-full h-10 items-center"
      style={[flex.flexRow, gap.medium]}>
      <View
        className="items-center p-2"
        style={[flex.flexRow, background(COLOR.black, 0.1), rounded.max]}>
        <Search width={14} height={14} />
      </View>
      <View className="flex-1" style={[flex.flexRow]}>
        {splittedItemValues?.map((splitItemValue: string, index: number) => {
          return (
            <>
              <Text className="text-base tracking-wide font-bold">
                {splitItemValue}
              </Text>
              {index !== splittedItemValues.length - 1 && (
                <Text className="text-base tracking-wide">{searchTerm}</Text>
              )}
            </>
          );
        })}
      </View>
      <View className="rotate-180">
        <DiagonalArrow width={14} height={14} color={COLOR.black} />
      </View>
    </View>
  );
};

export {AutoCompleteSearchItem};
