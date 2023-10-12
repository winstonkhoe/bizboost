import {
  View,
  Text,
  Pressable,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
import Search from '../../assets/vectors/search.svg';
import CrossMark from '../../assets/vectors/cross-mark.svg';
import {flex} from '../../styles/Flex';
import {useRef} from 'react';
import ChevronLeft from '../../assets/vectors/chevron-left.svg';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {
  closeSearchPage,
  openSearchPage,
  updateSearchTerm,
} from '../../redux/slices/searchSlice';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';

const SearchBar = () => {
  const searchInputRef = useRef<TextInput>(null);
  const {searchTerm, isOnSearchPage} = useAppSelector(state => state.search);
  const dispatch = useAppDispatch();

  const clearInput = (event: GestureResponderEvent) => {
    event.stopPropagation();
    searchInputRef.current?.clear();
    dispatch(updateSearchTerm(''));
  };

  const search = () => {
    if (searchTerm.trim().length > 0) {
      console.log('searching for', searchTerm);
    }
  };

  return (
    <View
      className="w-full h-10 flex flex-row justify-center items-center text-center"
      style={[gap.small]}>
      {isOnSearchPage && (
        <Pressable
          onPress={(event: GestureResponderEvent) => {
            dispatch(closeSearchPage());
            searchInputRef.current?.blur();
            clearInput(event);
          }}>
          <ChevronLeft width={25} height={25} color={COLOR.black} />
        </Pressable>
      )}
      <Pressable
        className="flex-1"
        onPress={() => {
          searchInputRef.current?.focus();
        }}>
        <View
          className="flex-1 h-full items-center p-2 bg-black/10 rounded-lg"
          style={[flex.flexRow]}>
          <View className="h-full items-center mr-2" style={[flex.flexRow]}>
            <Search width={14} />
          </View>
          <View className="flex-1 h-full items-center" style={flex.flexRow}>
            <TextInput
              ref={searchInputRef}
              value={searchTerm}
              onFocus={() => dispatch(openSearchPage())}
              onChangeText={(text: string) => dispatch(updateSearchTerm(text))}
              className="font-medium"
              style={[textColor(COLOR.black, 1)]}
              placeholder="David William"
              onSubmitEditing={search}
              returnKeyType="search"
            />
          </View>
          {isOnSearchPage && searchTerm.length > 0 ? (
            <Pressable
              className="h-full items-center rounded-full bg-black/40"
              style={[flex.flexRow]}
              onPress={clearInput}>
              <View
                className="items-center justify-center h-5 w-6"
                style={[flex.flexRow]}>
                <CrossMark width={20} height={20} color="#fff" />
              </View>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        className="h-full px-3 flex justify-center items-center"
        onPress={search}>
        <Text className="text-black font-semibold text-xs">Search</Text>
      </Pressable>
    </View>
  );
};

export {SearchBar};
