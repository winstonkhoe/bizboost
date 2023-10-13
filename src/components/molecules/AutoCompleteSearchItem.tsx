import {Pressable, Text, View} from 'react-native';
import {flex} from '../../styles/Flex';
import Search from '../../assets/vectors/search.svg';
import DiagonalArrow from '../../assets/vectors/diagonal-arrow.svg';
import {gap} from '../../styles/Gap';
import {background} from '../../styles/BackgroundColor';
import {COLOR} from '../../styles/Color';
import {rounded} from '../../styles/BorderRadius';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {updateSearchTerm} from '../../redux/slices/searchSlice';

interface Props {
  itemValue: string;
}

const AutoCompleteSearchItem = ({itemValue}: Props) => {
  const dispatch = useAppDispatch();
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
              <Text
                key={`nst-${index}`}
                className="text-base tracking-wide font-bold">
                {splitItemValue}
              </Text>
              {index !== splittedItemValues.length - 1 && (
                <Text key={`st-${index}`} className="text-base tracking-wide">
                  {searchTerm}
                </Text>
              )}
            </>
          );
        })}
      </View>
      <Pressable
        className="rotate-180"
        onPress={() => dispatch(updateSearchTerm(itemValue))}>
        <DiagonalArrow width={14} height={14} color={COLOR.black} />
      </Pressable>
    </View>
  );
};

export {AutoCompleteSearchItem};
