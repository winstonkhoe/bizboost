import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import SafeAreaContainer from '../containers/SafeAreaContainer';
import ArrowUp from '../assets/vectors/arrow-up.svg';
import ArrowDown from '../assets/vectors/arrow-down.svg';
import ArrowUpDown from '../assets/vectors/arrow-up-down.svg';

import Filter from '../assets/vectors/filter.svg';
import {flex, justify} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';
import {gap} from '../styles/Gap';
import {User} from '../model/User';
import {background} from '../styles/BackgroundColor';
import {CustomButton} from '../components/atoms/Button';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {Location} from '../model/Location';
import {useAppSelector} from '../redux/hooks';
import {getSimilarContentCreators} from '../validations/user';
import {
  HorizontalPadding,
  VerticalPadding,
} from '../components/atoms/ViewPadding';
import {useDispatch, useSelector} from 'react-redux';
import {setOnSearchPage} from '../redux/searchSlice';
import {useCategory} from '../hooks/category';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import {SheetModal} from '../containers/SheetModal';

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

  const {isOnSearchPage, searchTerm} = useSelector(state => state.search);

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

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        opacity={1}
        style={[props.style, background(COLOR.black[100])]}
      />
    ),
    [],
  );

  useEffect(() => {
    if (filterModalState) {
      modalRef.current?.present();
    } else {
      modalRef.current?.close();
    }
  }, [filterModalState]);

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

  const handleCategoryPress = category => {
    if (selectedFilters.categories.includes(category)) {
      setSelectedFilters(prevState => ({
        ...prevState,
        categories: prevState.categories.filter(cat => cat !== category),
      }));
    } else {
      setSelectedFilters(prevState => ({
        ...prevState,
        categories: [...prevState.categories, category],
      }));
    }
  };

  const handleSortByRating = sort => {
    setSortByInstagram(0);
    setSortByTiktok(0);
    if (sort) {
      if (sortByRating === 0 || sortByRating === 2) {
        setSortByRating(1);
      } else if (sortByRating === 1) {
        setSortByRating(2);
      }
    } else {
      setSortByRating(0);
    }
  };

  const handleSortByInstagram = sort => {
    if (sort) {
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

  const handleSortByTiktok = sort => {
    if (sort) {
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
      <ScrollView
        className="flex-1"
        style={[
          flex.flex1,
          {
            paddingTop: Math.max(safeAreaInsets.top, size.large),
          },
          background(COLOR.background.neutral.default),
        ]}>
        {/* Navbar */}
        {navbarState && (
          <Animated.View
            style={[flex.flexCol, navbarStyle]}
            className="px-3 justify-start">
            <Text className="text-black text-xl font-bold">
              Perfect content creators
            </Text>
            <Text className="text-black text-xl font-bold">
              for your campaigns
            </Text>
          </Animated.View>
        )}

        {/* Search Bar */}
        <PageWithSearchBar>
          <View className="px-3">
            <View style={flex.flexRow} className="gap-x-1 pb-2 items-center">
              <Pressable
                onPress={() => setFilterModalState(true)}
                style={flex.flexRow}
                className="rounded-md border border-zinc-500 justify-between items-center px-2 py-1">
                {selectedFilters.categories.length > 0 ||
                selectedFilters.locations.length > 0 ? (
                  <Text className="px-2 text-white text-xs bg-primary rounded-lg">
                    {selectedFilters.categories.length +
                      selectedFilters.locations.length}
                  </Text>
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

            {filteredContentCreators.length > 0 ? (
              <View style={[flex.flexRow, justify.between]}>
                <View style={(flex.flexCol, gap.default)}>
                  {filteredContentCreators.map((item, index) =>
                    index % 2 === 0 ? (
                      <ContentCreatorCard
                        key={item.id}
                        id={item.id?.toString()}
                        name={item.contentCreator?.fullname ?? ''}
                        categories={item.contentCreator?.specializedCategoryIds}
                        rating={item.contentCreator?.rating}
                        imageUrl={
                          item.contentCreator?.profilePicture ||
                          'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default%2Fdefault-content-creator.jpeg?alt=media&token=fe5aa7a5-1c1c-45bd-bec5-6f3e766e5ea7'
                        }
                      />
                    ) : null,
                  )}
                </View>
                <View style={(flex.flexCol, gap.default)}>
                  {filteredContentCreators.map((item, index) =>
                    index % 2 !== 0 ? (
                      <ContentCreatorCard
                        key={item.id}
                        id={item.id?.toString()}
                        name={item.contentCreator?.fullname ?? ''}
                        categories={item.contentCreator?.specializedCategoryIds}
                        rating={item.contentCreator?.rating}
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
              <View>
                <Text>No content creators</Text>
              </View>
            )}
          </View>
        </PageWithSearchBar>
      </ScrollView>

      <SheetModal
        open={filterModalState}
        onDismiss={handleClosePress}
        fullHeight
        snapPoints={['90%', '100%']}
        enableDynamicSizing={false}
        enablePanDownToClose>
        <BottomSheetScrollView>
          <HorizontalPadding paddingSize="medium">
            <Text className="text-2xl font-bold text-black">Set filters</Text>
          </HorizontalPadding>
          <HorizontalPadding paddingSize="medium">
            <View style={flex.flexCol}>
              <VerticalPadding>
                <Text className="text-lg font-bold text-black">
                  Choose category
                </Text>

                <View style={flex.flexRow} className="py-2 flex-wrap gap-2">
                  {categories.map((ct, idx) => (
                    <Pressable
                      key={idx}
                      className={`border rounded-md p-2 ${
                        selectedFilters.categories.includes(ct.id)
                          ? 'border-primary bg-primary'
                          : 'border-primary bg-white'
                      }`}
                      onPress={() => handleCategoryPress(ct.id)}>
                      <Text
                        className={`${
                          selectedFilters.categories.includes(ct.id)
                            ? 'text-white'
                            : 'text-black'
                        }`}>
                        {ct.id}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </VerticalPadding>
              <View>
                <Text className="text-lg font-bold text-black">
                  Choose preferred location
                </Text>

                <View style={flex.flexRow} className="py-2 flex-wrap gap-2">
                  {locations.map((loc, idx) => (
                    <Pressable
                      key={idx}
                      className={`border rounded-md p-2 ${
                        selectedFilters.locations.includes(loc.id)
                          ? 'border-primary bg-primary'
                          : 'border-primary bg-white'
                      }`}
                      onPress={() => handleLocationPress(loc.id)}>
                      <Text
                        className={`${
                          selectedFilters.locations.includes(loc.id)
                            ? 'text-white'
                            : 'text-black'
                        }`}>
                        {loc.id}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View className="py-4">
                <CustomButton
                  onPress={handleClosePress}
                  text="Apply filters"
                  rounded="default"
                />
              </View>
            </View>
          </HorizontalPadding>
        </BottomSheetScrollView>
      </SheetModal>
    </>
  );
};

export default ContentCreatorsScreen;

const styles = StyleSheet.create({
  categoriesContainer: {
    width: 185,
    marginLeft: 5,
    paddingVertical: 5,
  },
  category: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'normal',
  },
  sortButton: {
    width: Dimensions.get('window').width * 0.28,
  },
});
