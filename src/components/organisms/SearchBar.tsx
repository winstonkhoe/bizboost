import {
  View,
  Text,
  Pressable,
  TextInput,
  GestureResponderEvent,
} from 'react-native';
import Search from '../../assets/vectors/search.svg';
import CrossMark from '../../assets/vectors/cross-mark.svg';
import {flex, items, justify} from '../../styles/Flex';
import {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from '../../redux/hooks';
import {
  closeSearchPage,
  openSearchPage,
  updateSearchTerm,
} from '../../redux/slices/searchSlice';
import {gap} from '../../styles/Gap';
import {COLOR} from '../../styles/Color';
import {textColor} from '../../styles/Text';
import {horizontalPadding, padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {background} from '../../styles/BackgroundColor';
import {useNavigation} from '@react-navigation/native';
import {
  TabNavigation,
  TabNavigationProps,
} from '../../navigation/TabNavigation';
import {useUser} from '../../hooks/user';
import {UserRole} from '../../model/User';
import {ChevronLeft, SearchIcon} from '../atoms/Icon';
import {font} from '../../styles/Font';

const SearchBar = () => {
  const {activeRole} = useUser();

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
    if (activeRole === UserRole.ContentCreator) {
      navigation.navigate(TabNavigation.Campaigns);
    } else {
      navigation.navigate(TabNavigation.ContentCreators);
    }
  };

  return (
    <View
      className="h-10"
      style={[flex.flexRow, justify.center, gap.small, items.center]}>
      {isOnSearchPage && (
        <Pressable
          onPress={(event: GestureResponderEvent) => {
            dispatch(closeSearchPage());
            searchInputRef.current?.blur();
            clearInput(event);
          }}>
          <ChevronLeft
            size="xlarge"
            strokeWidth={1.5}
            color={COLOR.black[100]}
          />
        </Pressable>
      )}
      <Pressable
        style={[
          flex.flex1,
          horizontalPadding.small,
          rounded.default,
          background(COLOR.black[5]),
        ]}
        onPress={() => {
          dispatch(openSearchPage());
          searchInputRef.current?.focus();
        }}>
        <View className="flex-1 items-center" style={[flex.flexRow, gap.small]}>
          <View style={[flex.flexRow, items.center]}>
            <SearchIcon size="medium" color={COLOR.text.neutral.med} />
          </View>
          <View className="flex-1 items-center" style={flex.flexRow}>
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
              placeholder="Search here"
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
        style={[
          flex.flexRow,
          justify.center,
          items.center,
          padding.horizontal.default,
        ]}
        onPress={search}>
        <Text
          className="font-semibold"
          style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
          Search
        </Text>
      </Pressable>
    </View>
  );
};

export {SearchBar};
