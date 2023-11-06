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
import {useEffect, useRef} from 'react';
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
import {horizontalPadding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {useNavigation} from '@react-navigation/native';
import {
  TabNavigation,
  TabNavigationProps,
} from '../../navigation/TabNavigation';

const SearchBar = () => {
  const searchInputRef = useRef<TextInput>(null);
  const {searchTerm, isOnSearchPage} = useAppSelector(state => state.search);
  const dispatch = useAppDispatch();
  const navigation = useNavigation<TabNavigationProps>();

  const clearInput = (event: GestureResponderEvent) => {
    event.stopPropagation();
    searchInputRef.current?.clear();
    dispatch(updateSearchTerm(''));
  };

  useEffect(() => {
    if (!isOnSearchPage && searchInputRef) {
      searchInputRef.current?.blur();
    }
    if (isOnSearchPage && searchInputRef) {
      searchInputRef.current?.focus();
    }
  }, [isOnSearchPage, searchInputRef]);

  const search = () => {
    dispatch(closeSearchPage());
    navigation.navigate(TabNavigation.Campaigns);
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
          <ChevronLeft width={25} height={25} color={COLOR.black[100]} />
        </Pressable>
      )}
      <Pressable
        className="flex-1"
        style={[
          horizontalPadding.small,
          rounded.default,
          background(COLOR.black[5]),
        ]}
        onPress={() => {
          dispatch(openSearchPage());
          searchInputRef.current?.focus();
        }}>
        <View className="flex-1 items-center" style={[flex.flexRow, gap.small]}>
          <View className="h-full items-center" style={[flex.flexRow]}>
            <Search width={14} />
          </View>
          <View className="flex-1 h-full items-center" style={flex.flexRow}>
            <TextInput
              ref={searchInputRef}
              value={searchTerm}
              onFocus={() => {
                if (!isOnSearchPage) {
                  searchInputRef.current?.blur();
                }
              }}
              onPressIn={() => dispatch(openSearchPage())}
              onChangeText={(text: string) => dispatch(updateSearchTerm(text))}
              className="font-medium"
              style={[textColor(COLOR.black[100], 1)]}
              placeholder="David William"
              onSubmitEditing={search}
              returnKeyType="search"
            />
          </View>
          {isOnSearchPage && searchTerm.length > 0 ? (
            <Pressable
              className="h-min items-center justify-center bg-black/40"
              style={[flex.flexRow, rounded.max]}
              onPress={clearInput}>
              <CrossMark width={20} height={20} color={COLOR.black[0]} />
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
