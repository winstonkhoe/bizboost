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
import SafeAreaContainer from '../containers/SafeAreaContainer';

import Filter from '../assets/vectors/filter.svg';
import {flex} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';
import {gap} from '../styles/Gap';
import {User} from '../model/User';
import {Category} from '../model/Category';
import {background} from '../styles/BackgroundColor';
import {CustomButton} from '../components/atoms/Button';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {Location} from '../model/Location';

interface SelectedFilters {
  locations: string[];
  minPrice: number;
  maxPrice: number;
  categories: string[];
}

const ContentCreatorsScreen: React.FC = () => {
  const [contentCreators, setContentCreators] = useState<User[]>([]);
  const [filterModalState, setFilterModalState] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [filteredContentCreators, setFilteredContentCreators] = useState<
    User[]
  >([]);
  const [sortBy, setSortBy] = useState<number[]>([]);
  const [sortOrder, setSortOrder] = useState<number>(-1);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    locations: [],
    categories: [],
  });

  useEffect(() => {
    User.getContentCreators().then(contentCreatorsData => {
      setContentCreators(contentCreatorsData);
      setFilteredContentCreators(contentCreatorsData);
    });
    Category.getAll().then(categoriesData => setCategories(categoriesData));
    Location.getAll().then(locationsData => setLocations(locationsData));
  }, []);

  useEffect(() => {
    let sortedContentCreators = [...contentCreators];

    if (selectedFilters.categories.length > 0) {
      sortedContentCreators = sortedContentCreators.filter(
        contentCreator =>
          contentCreator.contentCreator?.specializedCategoryIds?.length > 0 &&
          contentCreator.contentCreator?.specializedCategoryIds.some(cat =>
            selectedFilters.categories.includes(cat),
          ),
      );
    }

    if (sortBy.includes(0)) {
      sortedContentCreators.sort((a, b) => {
        const ratingA = a.contentCreator?.rating;
        const ratingB = b.contentCreator?.rating;

        // Handle cases where one of them is null or undefined
        if (ratingA == null && ratingB == null) {
          return 0; // No change in order if both are null
        }
        if (ratingA == null) {
          return sortOrder === -1 ? 1 : -1; // Move null/undefined to the end
        }
        if (ratingB == null) {
          return sortOrder === -1 ? -1 : 1; // Move null/undefined to the end
        }

        return sortOrder === -1 ? ratingA - ratingB : ratingB - ratingA;
      });
    }

    if (sortBy.includes(1)) {
      sortedContentCreators.sort((a, b) => {
        const followersA = a.instagram?.followersCount;
        const followersB = b.instagram?.followersCount;

        // Handle cases where one of them is null or undefined
        if (followersA == null && followersB == null) {
          return 0; // No change in order if both are null
        }
        if (followersA == null) {
          return sortOrder === -1 ? 1 : -1; // Move null/undefined to the end
        }
        if (followersB == null) {
          return sortOrder === -1 ? -1 : 1; // Move null/undefined to the end
        }

        return sortOrder === -1
          ? followersA - followersB
          : followersB - followersA;
      });
    }

    if (sortBy.includes(2)) {
      sortedContentCreators.sort((a, b) => {
        const followersA = a.tiktok?.followersCount;
        const followersB = b.tiktok?.followersCount;

        // Handle cases where one of them is null or undefined
        if (followersA == null && followersB == null) {
          return 0; // No change in order if both are null
        }
        if (followersA == null) {
          return sortOrder === -1 ? 1 : -1; // Move null/undefined to the end
        }
        if (followersB == null) {
          return sortOrder === -1 ? -1 : 1; // Move null/undefined to the end
        }

        return sortOrder === -1
          ? followersA - followersB
          : followersB - followersA;
      });
    }

    setFilteredContentCreators(sortedContentCreators);
  }, [selectedFilters, sortBy, sortOrder, contentCreators]);

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
    setSelectedFilters(prevState => ({
      ...prevState,
      locations: [...prevState.locations, location],
    }));
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

  const handleSort = sort => {
    if (sortBy.includes(sort)) {
      setSortBy(prevState => prevState.filter(s => s !== sort));
    } else {
      setSortBy(prevState => [...prevState, sort]);
    }
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaContainer>
        <ScrollView className="flex-1">
          {/* Navbar */}
          <View style={flex.flexCol} className="h-14 px-3 justify-start">
            <Text className="text-black text-xl font-bold">
              Perfect content creators
            </Text>
            <Text className="text-black text-xl font-bold">
              for your campaigns
            </Text>
          </View>

          {/* Search Bar */}
          <PageWithSearchBar>
            <View className="px-3">
              <View style={flex.flexRow} className="pb-2 items-center">
                <Pressable
                  onPress={() => setFilterModalState(true)}
                  style={flex.flexRow}
                  className="rounded-md border justify-between items-center px-2">
                  <Filter width={12} height={12} color={COLOR.black} />
                  <Text className="text-black pl-2 text-xs">Filter</Text>
                </Pressable>
                <ScrollView horizontal style={styles.categoriesContainer}>
                  <View style={flex.flexRow} className="gap-x-1 items-center">
                    {selectedFilters.categories &&
                      selectedFilters.categories.map((category, idx) => (
                        <View
                          key={idx}
                          style={flex.flexRow}
                          className="items-center justify-between bg-black rounded-md px-1">
                          <Text style={styles.category}>{category}</Text>
                          <Pressable
                            className="pl-2"
                            onPress={() => handleCategoryPress(category)}>
                            <Text className="text-white">x</Text>
                          </Pressable>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              </View>

              {filteredContentCreators.length > 0 ? (
                <View style={flex.flexRow} className="justify-between">
                  <View style={(flex.flexCol, gap.small)}>
                    {filteredContentCreators.map((item, index) =>
                      index % 2 === 0 ? (
                        <ContentCreatorCard
                          key={index}
                          id={item.id?.toString()}
                          name={item.contentCreator?.fullname ?? ''}
                          categories={
                            item.contentCreator?.specializedCategoryIds
                          }
                          imageUrl={
                            item.contentCreator?.profilePicture ??
                            'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default-content-creator.jpeg?alt=media&token=ce612a34-4273-41cc-8365-c73195b97bad&_gl=1*1117w4m*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5OTQyNzUzNC41Ny4xLjE2OTk0Mjc2MTEuNDQuMC4w'
                          }
                        />
                      ) : null,
                    )}
                  </View>
                  <View style={(flex.flexCol, gap.small)}>
                    {filteredContentCreators.map((item, index) =>
                      index % 2 !== 0 ? (
                        <ContentCreatorCard
                          key={index}
                          id={item.id?.toString()}
                          name={item.contentCreator?.fullname ?? ''}
                          categories={
                            item.contentCreator?.specializedCategoryIds
                          }
                          imageUrl={
                            item.contentCreator?.profilePicture ??
                            'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default-content-creator.jpeg?alt=media&token=ce612a34-4273-41cc-8365-c73195b97bad&_gl=1*1117w4m*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5OTQyNzUzNC41Ny4xLjE2OTk0Mjc2MTEuNDQuMC4w'
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

        <BottomSheetModal
          ref={modalRef}
          onDismiss={handleClosePress}
          backdropComponent={renderBackdrop}
          snapPoints={['90%']}
          index={0}
          enablePanDownToClose>
          <BottomSheetScrollView>
            <View className="px-4 py-2">
              <Text className="text-2xl font-bold text-black">Set filters</Text>
            </View>
            <View style={(flex.flexCol, gap.medium)} className="p-4">
              <View>
                <Text className="text-lg font-bold text-black">Sort by</Text>
                <View style={flex.flexRow}>
                  <Pressable
                    style={(flex.flexRow, styles.sortButton)}
                    className={`${
                      sortBy.includes(0)
                        ? 'bg-primary'
                        : 'border border-zinc-200'
                    } rounded-l-md p-2 justify-center items-center text-center`}
                    onPress={() => handleSort(0)}>
                    <Text
                      className={`${
                        sortBy.includes(0) ? 'text-white' : 'text-black'
                      }`}>
                      Rating
                    </Text>
                  </Pressable>
                  <Pressable
                    style={(flex.flexRow, styles.sortButton)}
                    className={`${
                      sortBy.includes(1)
                        ? 'bg-primary'
                        : 'border border-zinc-200'
                    } p-2 justify-center items-center text-center`}
                    onPress={() => handleSort(1)}>
                    <Text
                      className={`${
                        sortBy.includes(1) ? 'text-white' : 'text-black'
                      }`}>
                      Instagram Followers
                    </Text>
                  </Pressable>
                  <Pressable
                    style={(flex.flexRow, styles.sortButton)}
                    className={`${
                      sortBy.includes(2)
                        ? 'bg-primary'
                        : 'border border-zinc-200'
                    } rounded-r-md p-2 justify-center items-center text-center`}
                    onPress={() => handleSort(2)}>
                    <Text
                      className={`${
                        sortBy.includes(2) ? 'text-white' : 'text-black'
                      }`}>
                      Tiktok Followers
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View>
                <Text className="text-lg font-bold text-black">Sort order</Text>
                <View style={flex.flexRow}>
                  <Pressable
                    style={(flex.flexRow, styles.sortButton)}
                    className={`${
                      sortOrder === -1 ? 'bg-primary' : 'border border-zinc-200'
                    } rounded-l-md p-2 justify-center items-center text-center`}
                    onPress={() => setSortOrder(-1)}>
                    <Text
                      className={`${
                        sortOrder === -1 ? 'text-white' : 'text-black'
                      }`}>
                      Ascending
                    </Text>
                  </Pressable>
                  <Pressable
                    style={(flex.flexRow, styles.sortButton)}
                    className={`${
                      sortOrder === 0 ? 'bg-primary' : 'border border-zinc-200'
                    } rounded-r-md p-2 justify-center items-center text-center`}
                    onPress={() => setSortOrder(0)}>
                    <Text
                      className={`${
                        sortOrder === 0 ? 'text-white' : 'text-black'
                      }`}>
                      Descending
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View>
                <Text className="text-lg font-bold text-black">Location</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-black">
                  Choose category
                </Text>

                <View style={flex.flexRow} className="py-2 flex-wrap gap-2">
                  {categories.map((ct, idx) => (
                    <Pressable
                      key={idx}
                      className={`border rounded-md p-1 ${
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
              </View>
              <View className="py-4">
                <CustomButton
                  onPress={handleClosePress}
                  text="Apply filters"
                  rounded="default"
                />
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </SafeAreaContainer>
    </BottomSheetModalProvider>
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