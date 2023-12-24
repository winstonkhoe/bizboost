import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import {gap} from '../styles/Gap';
import {User} from '../model/User';
import {background} from '../styles/BackgroundColor';
import {CustomButton} from '../components/atoms/Button';
import {
  SearchAutocompletePlaceholder,
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
import {SearchBar} from '../components/organisms/SearchBar';
import {ContentCreatorList} from '../components/organisms/ContentCreatorList';

interface SelectedFilters {
  locations: string[];
  categories: string[];
}

enum SortField {
  Rating = 'Rating',
  Instagram = 'Instagram',
  Tiktok = 'Tiktok',
}

enum SortDirection {
  Descending = 1,
  Ascending = -1,
  Normal = 0,
}

interface SortConfig {
  field?: SortField;
  direction?: SortDirection;
}

const ContentCreatorsScreen: React.FC = () => {
  const [contentCreators, setContentCreators] = useState<User[]>();
  const [filterModalState, setFilterModalState] = useState(false);
  const [navbarState, setNavbarState] = useState(true);
  const {categories} = useCategory();
  const safeAreaInsets = useSafeAreaInsets();
  const [locations, setLocations] = useState<Location[]>([]);

  const {isOnSearchPage, searchTerm} = useAppSelector(state => state.search);

  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    locations: [],
    categories: [],
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: undefined,
    direction: undefined,
  });

  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    User.getContentCreators()
      .then(contentCreatorsData => {
        setContentCreators(contentCreatorsData);
      })
      .catch(() => setContentCreators([]));
    Location.getAll()
      .then(setLocations)
      .catch(() => setLocations([]));
  }, []);

  const getFilteredField = useCallback(
    (user: User) => {
      if (sortConfig.field === SortField.Instagram) {
        return user.instagram?.followersCount ?? 0;
      }
      if (sortConfig.field === SortField.Tiktok) {
        return user.tiktok?.followersCount ?? 0;
      }
      return user?.contentCreator?.rating || 0;
    },
    [sortConfig],
  );

  const filteredContentCreators = useMemo(() => {
    if (!contentCreators) {
      return Array(6);
    }
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

    return sortedContentCreators.sort((a, b) => {
      if (sortConfig.direction === SortDirection.Normal) {
        return 0;
      }
      const fieldA = getFilteredField(a);
      const fieldB = getFilteredField(b);
      if (fieldA < fieldB) {
        return sortConfig.direction === SortDirection.Ascending ? -1 : 1;
      }
      if (fieldA > fieldB) {
        return sortConfig.direction === SortDirection.Ascending ? 1 : -1;
      }
      return 0;
    });
  }, [
    selectedFilters,
    sortConfig,
    searchTerm,
    contentCreators,
    getFilteredField,
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
                style={[
                  font.size[50],
                  font.weight.bold,
                  textColor(COLOR.text.neutral.high),
                ]}>
                Perfect content creators
              </Text>
              <Text
                style={[
                  font.size[50],
                  font.weight.bold,
                  textColor(COLOR.text.neutral.high),
                ]}>
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
                  {
                    marginTop: size.default,
                  },
                ]}>
                <Pressable
                  onPress={() => setFilterModalState(true)}
                  style={[
                    flex.flexRow,
                    items.center,
                    padding.horizontal.default,
                    padding.vertical.small,
                    rounded.default,
                    gap.xsmall,
                    border({
                      borderWidth: 1,
                      color: COLOR.black[25],
                    }),
                  ]}>
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
                        style={[
                          font.size[10],
                          font.weight.bold,
                          textColor(COLOR.black[0]),
                        ]}>
                        {selectedFilters.categories.length +
                          selectedFilters.locations.length}
                      </Text>
                    </View>
                  ) : (
                    <Filter
                      width={15}
                      height={15}
                      color={COLOR.text.neutral.low}
                    />
                  )}
                  <Text
                    style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                    Filter
                  </Text>
                </Pressable>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    padding.horizontal.small,
                    flex.flexRow,
                    gap.small,
                  ]}>
                  {[
                    SortField.Rating,
                    SortField.Instagram,
                    SortField.Tiktok,
                  ].map(sortField => (
                    <FilterSort
                      key={sortField}
                      field={sortField}
                      currentSortConfig={sortConfig}
                      onSortChange={setSortConfig}
                    />
                  ))}
                </ScrollView>
              </View>
            </HideOnActiveSearch>
          </View>
          <SearchAutocompletePlaceholder>
            <View style={[padding.horizontal.default]}>
              <ContentCreatorList data={filteredContentCreators} />
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
              style={[
                font.size[50],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}>
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
                style={[
                  font.size[40],
                  font.weight.bold,
                  textColor(COLOR.text.neutral.high),
                ]}>
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
                style={[
                  font.size[40],
                  font.weight.bold,
                  textColor(COLOR.text.neutral.high),
                ]}>
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
        style={[
          font.weight.semibold,
          props.isSelected
            ? [textColor(COLOR.black[0])]
            : [textColor(COLOR.text.neutral.med)],
        ]}>
        {props.text}
      </Text>
    </Pressable>
  );
};

interface FilterSortProps extends PressableProps {
  field: SortField;
  currentSortConfig: SortConfig;
  onSortChange: (config: SortConfig) => void;
}

const FilterSort = ({
  field,
  currentSortConfig,
  onSortChange,
  ...props
}: FilterSortProps) => {
  const isActiveFilter = currentSortConfig.field === field;
  const sortDirection = isActiveFilter ? currentSortConfig.direction : 0;
  const isDescending =
    isActiveFilter && SortDirection.Descending === sortDirection;
  const isAscending =
    isActiveFilter && SortDirection.Ascending === sortDirection;
  const isNormal = SortDirection.Normal === sortDirection;

  const getNextSortConfigDirection = () => {
    if (isNormal) {
      return SortDirection.Descending;
    }
    if (isDescending) {
      return SortDirection.Ascending;
    }
    return SortDirection.Normal;
  };

  return (
    <Pressable
      {...props}
      onPress={() =>
        onSortChange({
          direction: getNextSortConfigDirection(),
          field: field,
        })
      }
      style={[
        flex.flexRow,
        items.center,
        gap.small,
        padding.horizontal.default,
        padding.vertical.small,
        rounded.medium,
        isNormal && [
          border({
            borderWidth: 1,
            color: COLOR.black[25],
          }),
        ],
        (isAscending || isDescending) && [
          background(COLOR.green[40]),
          {
            borderWidth: 1,
            borderColor: 'transparent',
          },
        ],
      ]}>
      <Text
        style={[
          font.size[20],
          font.weight.medium,
          textColor(COLOR.text.neutral.med),
          (isAscending || isDescending) && [textColor(COLOR.absoluteBlack[0])],
        ]}>
        {field}
      </Text>
      {isNormal && (
        <ArrowUpDown width={15} height={15} color="rgb(113, 113, 122)" />
      )}
      {isDescending && <ArrowDown width={15} height={15} color={COLOR.white} />}
      {isAscending && <ArrowUp width={15} height={15} color={COLOR.white} />}
    </Pressable>
  );
};

export default ContentCreatorsScreen;
