import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  PressableProps,
} from 'react-native';
import {BottomSheetModal, BottomSheetScrollView} from '@gorhom/bottom-sheet';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import ArrowUp from '../assets/vectors/arrow-up.svg';
import ArrowDown from '../assets/vectors/arrow-down.svg';
import ArrowUpDown from '../assets/vectors/arrow-up-down.svg';

import Filter from '../assets/vectors/filter.svg';
import {flex, items, justify} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';
import {gap} from '../styles/Gap';
import {User} from '../model/User';
import {background} from '../styles/BackgroundColor';
import {CustomButton} from '../components/atoms/Button';
import {
  SearchAutocompletePlaceholder,
  PageWithSearchBar,
  HideOnActiveSearch,
} from '../components/templates/PageWithSearchBar';
import {Location} from '../model/Location';
import {useAppSelector} from '../redux/hooks';
import {getSimilarContentCreators} from '../validations/user';
import {useCategory} from '../hooks/category';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import {SheetModal} from '../containers/SheetModal';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {InternalLink} from '../components/atoms/Link';
import {border} from '../styles/Border';
import {EmptyPlaceholder} from '../components/templates/EmptyPlaceholder';
import {SearchBar} from '../components/organisms/SearchBar';

interface SelectedFilters {
  locations: string[];
  categories: string[];
}

const ContentCreatorsScreen: React.FC = () => {
  const [contentCreators, setContentCreators] = useState<User[]>([]);
  const [filterModalState, setFilterModalState] = useState(false);
  const [navbarState, setNavbarState] = useState(true);
  const {categories} = useCategory();
  const safeAreaInsets = useSafeAreaInsets();
  const [locations, setLocations] = useState<Location[]>([]);

  const {isOnSearchPage, searchTerm} = useAppSelector(state => state.search);

  const [filteredContentCreators, setFilteredContentCreators] = useState<
    User[]
  >([]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    locations: [],
    categories: [],
  });
  const [sortByRating, setSortByRating] = useState<number>(0);
  const [sortByInstagram, setSortByInstagram] = useState<number>(0);
  const [sortByTiktok, setSortByTiktok] = useState<number>(0);

  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    User.getContentCreators().then(contentCreatorsData => {
      setContentCreators(contentCreatorsData);
      setFilteredContentCreators(contentCreatorsData);
    });
    Location.getAll().then(setLocations);
  }, []);

  useEffect(() => {
    let sortedContentCreators = [...contentCreators];

    if (searchTerm && searchTerm !== '') {
      sortedContentCreators = getSimilarContentCreators(
        sortedContentCreators,
        searchTerm,
      );
    }

    if (selectedFilters.categories.length > 0) {
      sortedContentCreators = sortedContentCreators.filter(
        contentCreator =>
          contentCreator.contentCreator?.specializedCategoryIds &&
          contentCreator.contentCreator?.specializedCategoryIds?.length > 0 &&
          contentCreator.contentCreator?.specializedCategoryIds.some(cat =>
            selectedFilters.categories.includes(cat),
          ),
      );
    }

    if (selectedFilters.locations.length > 0) {
      sortedContentCreators = sortedContentCreators.filter(
        contentCreator =>
          contentCreator.contentCreator?.preferredLocationIds &&
          contentCreator.contentCreator?.preferredLocationIds?.length > 0 &&
          contentCreator.contentCreator?.preferredLocationIds.some(loc =>
            selectedFilters.locations.includes(loc),
          ),
      );
    }

    if (sortByRating !== 0) {
      sortedContentCreators.sort((a, b) => {
        const ratingA = a.contentCreator?.rating;
        const ratingB = b.contentCreator?.rating;

        if (ratingA == null && ratingB == null) {
          return 0;
        }
        if (ratingA == null) {
          return sortByRating === 1 ? 1 : -1;
        }
        if (ratingB == null) {
          return sortByRating === 1 ? -1 : 1;
        }

        return sortByRating === 1 ? ratingA - ratingB : ratingB - ratingA;
      });
    }

    if (sortByInstagram !== 0) {
      sortedContentCreators.sort((a, b) => {
        const followersA = a.instagram?.followersCount;
        const followersB = b.instagram?.followersCount;

        if (followersA == null && followersB == null) {
          return 0;
        }
        if (followersA == null) {
          return sortByInstagram === 1 ? 1 : -1;
        }
        if (followersB == null) {
          return sortByInstagram === 1 ? -1 : 1;
        }

        return sortByInstagram === 1
          ? followersA - followersB
          : followersB - followersA;
      });
    }

    if (sortByTiktok !== 0) {
      sortedContentCreators.sort((a, b) => {
        const followersA = a.tiktok?.followersCount;
        const followersB = b.tiktok?.followersCount;

        if (followersA == null && followersB == null) {
          return 0;
        }
        if (followersA == null) {
          return sortByTiktok === 1 ? 1 : -1;
        }
        if (followersB == null) {
          return sortByTiktok === 1 ? -1 : 1;
        }

        return sortByTiktok === 1
          ? followersA - followersB
          : followersB - followersA;
      });
    }

    setFilteredContentCreators(sortedContentCreators);
  }, [
    selectedFilters,
    sortByRating,
    sortByInstagram,
    sortByTiktok,
    searchTerm,
    contentCreators,
  ]);

  const modalRef = useRef<BottomSheetModal>(null);
  const handleClosePress = () => setFilterModalState(false);

  useEffect(() => {
    if (filterModalState) {
      modalRef.current?.present();
    } else {
      modalRef.current?.close();
    }
  }, [filterModalState]);

  const resetFilter = () => {
    setSelectedFilters({
      locations: [],
      categories: [],
    });
  };

  const handleLocationPress = (location: string) => {
    if (selectedFilters.locations.includes(location)) {
      setSelectedFilters(prevState => ({
        ...prevState,
        locations: prevState.locations.filter(loc => loc !== location),
      }));
    } else {
      setSelectedFilters(prevState => ({
        ...prevState,
        locations: [...prevState.locations, location],
      }));
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    if (selectedFilters.categories.includes(categoryId)) {
      setSelectedFilters(prevState => ({
        ...prevState,
        categories: prevState.categories.filter(cat => cat !== categoryId),
      }));
    } else {
      setSelectedFilters(prevState => ({
        ...prevState,
        categories: [...prevState.categories, categoryId],
      }));
    }
  };

  const handleSortByRating = (isSort: boolean) => {
    setSortByInstagram(0);
    setSortByTiktok(0);
    if (isSort) {
      if (sortByRating === 0 || sortByRating === 2) {
        setSortByRating(1);
      } else if (sortByRating === 1) {
        setSortByRating(2);
      }
    } else {
      setSortByRating(0);
    }
  };

  const handleSortByInstagram = (isSort: boolean) => {
    if (isSort) {
      setSortByRating(0);
      setSortByTiktok(0);
      if (sortByInstagram === 0 || sortByInstagram === 2) {
        setSortByInstagram(1);
      } else if (sortByInstagram === 1) {
        setSortByInstagram(2);
      }
    } else {
      setSortByInstagram(0);
    }
  };

  const handleSortByTiktok = (isSort: boolean) => {
    if (isSort) {
      setSortByRating(0);
      setSortByInstagram(0);
      if (sortByTiktok === 0 || sortByTiktok === 2) {
        setSortByTiktok(1);
      } else if (sortByTiktok === 1) {
        setSortByTiktok(2);
      }
    } else {
      setSortByTiktok(0);
    }
  };

  const navbarOpacity = useSharedValue(1);

  useEffect(() => {
    navbarOpacity.value = withTiming(isOnSearchPage ? 0 : 1, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    });

    const delay = isOnSearchPage ? 300 : 0;
    setTimeout(() => {
      setNavbarState(isOnSearchPage === false);
    }, delay);
  }, [isOnSearchPage, navbarOpacity]);

  const navbarStyle = useAnimatedStyle(() => {
    return {
      opacity: navbarOpacity.value,
      transform: [
        {
          translateX: navbarOpacity.value === 0 ? -windowWidth : 0,
        },
      ],
    };
  });

  return (
    <>
      <View
        style={[
          flex.flex1,
          background(COLOR.background.neutral.default),
          {
            paddingTop: Math.max(safeAreaInsets.top, size.default),
          },
        ]}>
        <ScrollView
          scrollEnabled
          stickyHeaderIndices={[1]}
          onScrollEndDrag={event => console.log(event)}
          style={[flex.flex1]}
          contentContainerStyle={[flex.flexCol, padding.bottom.large]}>
          {/* Navbar */}
          {navbarState && (
            <Animated.View
              style={[
                flex.flexCol,
                navbarStyle,
                padding.bottom.small,
                padding.horizontal.default,
              ]}>
              <Text
                className="font-bold"
                style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
                Perfect content creators
              </Text>
              <Text
                className="font-bold"
                style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
                for your campaigns
              </Text>
            </Animated.View>
          )}

          {/* Search Bar */}
          <View
            style={[
              flex.flexCol,
              gap.default,
              padding.horizontal.default,
              padding.bottom.default,
              background(COLOR.background.neutral.default),
            ]}>
            <SearchBar />
            <HideOnActiveSearch>
              <View
                style={[
                  flex.flexRow,
                  gap.default,
                  {
                    marginTop: size.default,
                  },
                ]}>
                <Pressable
                  onPress={() => setFilterModalState(true)}
                  style={flex.flexRow}
                  className="rounded-md border border-zinc-500 justify-between items-center px-2 py-1">
                  {selectedFilters.categories.length > 0 ||
                  selectedFilters.locations.length > 0 ? (
                    <View
                      style={[
                        background(COLOR.green[50]),
                        rounded.max,
                        padding.vertical.xsmall2,
                        padding.horizontal.small,
                      ]}>
                      <Text
                        className="font-bold"
                        style={[font.size[20], textColor(COLOR.black[0])]}>
                        {selectedFilters.categories.length +
                          selectedFilters.locations.length}
                      </Text>
                    </View>
                  ) : (
                    <Filter
                      width={15}
                      height={15}
                      color="rgb(113 113 122)"
                      className="text-zinc-500"
                    />
                  )}
                  <Text className="text-zinc-500 pl-2 text-xs">Filter</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleSortByRating(sortByRating === 0)}
                  style={flex.flexRow}
                  className={`${
                    sortByRating === 0
                      ? 'border-zinc-500 bg-transparent'
                      : 'border-primary bg-primary '
                  }   rounded-md border justify-between items-center px-2 py-1`}>
                  <Text
                    className={`${
                      sortByRating === 0 ? 'text-zinc-500' : 'text-white'
                    } pr-2 text-xs`}>
                    Rating
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSortByRating(
                        sortByRating === 1 || sortByRating === 2 ? true : false,
                      )
                    }>
                    {sortByRating === 0 && (
                      <ArrowUpDown
                        width={15}
                        height={15}
                        color="rgb(113, 113, 122)"
                      />
                    )}
                    {sortByRating === 1 && (
                      <ArrowDown width={15} height={15} color={COLOR.white} />
                    )}
                    {sortByRating === 2 && (
                      <ArrowUp width={15} height={15} color={COLOR.white} />
                    )}
                  </Pressable>
                </Pressable>
                <Pressable
                  onPress={() => handleSortByInstagram(sortByInstagram === 0)}
                  style={flex.flexRow}
                  className={`${
                    sortByInstagram === 0
                      ? 'border-zinc-500 bg-transparent'
                      : 'border-primary bg-primary '
                  }   rounded-md border justify-between items-center px-2 py-1`}>
                  <Text
                    className={`${
                      sortByInstagram === 0 ? 'text-zinc-500' : 'text-white'
                    } pr-2 text-xs`}>
                    Instagram
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSortByInstagram(
                        sortByInstagram === 1 || sortByInstagram === 2
                          ? true
                          : false,
                      )
                    }>
                    {sortByInstagram === 0 && (
                      <ArrowUpDown
                        width={15}
                        height={15}
                        color="rgb(113, 113, 122)"
                      />
                    )}
                    {sortByInstagram === 1 && (
                      <ArrowDown width={15} height={15} color={COLOR.white} />
                    )}
                    {sortByInstagram === 2 && (
                      <ArrowUp width={15} height={15} color={COLOR.white} />
                    )}
                  </Pressable>
                </Pressable>
                <Pressable
                  onPress={() => handleSortByTiktok(sortByTiktok === 0)}
                  style={flex.flexRow}
                  className={`${
                    sortByTiktok === 0
                      ? 'border-zinc-500 bg-transparent'
                      : 'border-primary bg-primary '
                  }   rounded-md border justify-between items-center px-2 py-1`}>
                  <Text
                    className={`${
                      sortByTiktok === 0 ? 'text-zinc-500' : 'text-white'
                    } pr-2 text-xs`}>
                    Tiktok
                  </Text>
                  <Pressable
                    onPress={() =>
                      handleSortByTiktok(
                        sortByTiktok === 1 || sortByTiktok === 2 ? true : false,
                      )
                    }>
                    {sortByTiktok === 0 && (
                      <ArrowUpDown
                        width={15}
                        height={15}
                        color="rgb(113, 113, 122)"
                      />
                    )}
                    {sortByTiktok === 1 && (
                      <ArrowDown width={15} height={15} color={COLOR.white} />
                    )}
                    {sortByTiktok === 2 && (
                      <ArrowUp width={15} height={15} color={COLOR.white} />
                    )}
                  </Pressable>
                </Pressable>
              </View>
            </HideOnActiveSearch>
          </View>
          <SearchAutocompletePlaceholder>
            <View
              style={[
                flex.flex1,
                flex.flexCol,
                gap.default,
                padding.horizontal.default,
              ]}>
              {filteredContentCreators.length > 0 ? (
                <View style={[flex.flexRow, justify.between, gap.default]}>
                  <View style={[flex.flexCol, gap.default]}>
                    {filteredContentCreators.map((item, index) =>
                      index % 2 === 0 ? (
                        <ContentCreatorCard
                          key={item.id}
                          id={item.id || ''}
                          name={item.contentCreator?.fullname ?? ''}
                          categories={
                            item.contentCreator?.specializedCategoryIds
                          }
                          rating={item.contentCreator?.rating || 0}
                          imageUrl={
                            item.contentCreator?.profilePicture ||
                            'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default%2Fdefault-content-creator.jpeg?alt=media&token=fe5aa7a5-1c1c-45bd-bec5-6f3e766e5ea7'
                          }
                        />
                      ) : null,
                    )}
                  </View>
                  <View style={[flex.flexCol, gap.default]}>
                    {filteredContentCreators.map((item, index) =>
                      index % 2 !== 0 ? (
                        <ContentCreatorCard
                          key={item.id}
                          id={item.id || ''}
                          name={item.contentCreator?.fullname ?? ''}
                          categories={
                            item.contentCreator?.specializedCategoryIds
                          }
                          rating={item.contentCreator?.rating || 0}
                          imageUrl={
                            item.contentCreator?.profilePicture ||
                            'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default%2Fdefault-content-creator.jpeg?alt=media&token=fe5aa7a5-1c1c-45bd-bec5-6f3e766e5ea7'
                          }
                        />
                      ) : null,
                    )}
                  </View>
                </View>
              ) : (
                <View style={[flex.flexRow, items.center, padding.top.xlarge5]}>
                  <EmptyPlaceholder
                    title={
                      selectedFilters.categories.length > 0 ||
                      selectedFilters.locations.length > 0
                        ? 'No ideal content creator for this filter or search'
                        : "There isn't available content creator yet"
                    }
                    description="Try to change the filter or search for another content creator"
                  />
                </View>
              )}
            </View>
          </SearchAutocompletePlaceholder>
        </ScrollView>
      </View>

      <SheetModal
        open={filterModalState}
        onDismiss={handleClosePress}
        fullHeight
        snapPoints={['60%', '100%']}
        enableDynamicSizing={false}
        enableOverDrag={false}
        enablePanDownToClose>
        <View style={[flex.flexCol, flex.grow, gap.large]}>
          <View
            style={[flex.flexRow, justify.between, padding.horizontal.medium]}>
            <Text
              className="font-bold"
              style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
              Filter
            </Text>
            <InternalLink text="Reset" onPress={resetFilter} />
          </View>
          <BottomSheetScrollView
            style={[flex.flex1]}
            contentContainerStyle={[
              flex.flexCol,
              padding.horizontal.medium,
              gap.xlarge,
            ]}>
            <View style={[flex.flexCol, gap.default]}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                Category
              </Text>
              <View style={[flex.flexRow, flex.wrap, gap.default]}>
                {categories
                  .filter(ct => ct?.id)
                  .map(ct => {
                    return (
                      <FilterElement
                        key={ct.id}
                        text={ct.id!!}
                        isSelected={selectedFilters.categories.includes(
                          ct.id || '',
                        )}
                        onPress={() => {
                          if (ct.id) {
                            handleCategoryPress(ct.id);
                          }
                        }}
                      />
                    );
                  })}
              </View>
            </View>
            <View style={[flex.flexCol, gap.default]}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                Content Creator Territory
              </Text>

              <View style={[flex.flexRow, flex.wrap, gap.default]}>
                {locations
                  .filter(loc => loc?.id)
                  .map(loc => (
                    <FilterElement
                      key={loc.id}
                      text={loc.id!!}
                      isSelected={selectedFilters.locations.includes(
                        loc.id || '',
                      )}
                      onPress={() => {
                        if (loc.id) {
                          handleLocationPress(loc.id);
                        }
                      }}
                    />
                  ))}
              </View>
            </View>
          </BottomSheetScrollView>
          <View
            style={[
              padding.horizontal.default,
              {
                paddingBottom: Math.max(safeAreaInsets.bottom, size.large),
              },
            ]}>
            <CustomButton
              onPress={handleClosePress}
              text={`Show ${
                filteredContentCreators.length || 0
              } content creators`}
              rounded="default"
            />
          </View>
        </View>
      </SheetModal>
    </>
  );
};

interface FilterElementProps extends PressableProps {
  text: string;
  isSelected: boolean;
}

const FilterElement = ({...props}: FilterElementProps) => {
  return (
    <Pressable
      {...props}
      style={[
        rounded.default,
        {
          padding: 10,
        },
        props.isSelected
          ? [
              background(COLOR.green[30]),
              border({
                borderWidth: 1,
                color: COLOR.green[50],
              }),
              textColor(COLOR.black[0]),
            ]
          : [
              background(COLOR.black[0]),
              border({
                borderWidth: 1,
                color: COLOR.black[25],
              }),
              textColor(COLOR.black[100]),
            ],
      ]}>
      <Text
        className="font-semibold"
        style={[
          props.isSelected
            ? [textColor(COLOR.black[0])]
            : [textColor(COLOR.text.neutral.med)],
        ]}>
        {props.text}
      </Text>
    </Pressable>
  );
};

export default ContentCreatorsScreen;
