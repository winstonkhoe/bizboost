import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, ScrollView, Pressable} from 'react-native';
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
import {SelectedFilters, styles} from './ContentCreatorsScreen';

export const ContentCreatorsScreen: React.FC = () => {
  const [contentCreators, setContentCreators] = useState<User[]>([]);
  const [filterModalState, setFilterModalState] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    locations: [],
    minPrice: 0,
    maxPrice: 100,
    categories: [],
  });

  useEffect(() => {
    User.getContentCreators().then(contentCreatorsData =>
      setContentCreators(contentCreatorsData),
    );
    Category.getAll().then(categoriesData => setCategories(categoriesData));
  }, []);

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
      // If category is already selected, remove it
      setSelectedFilters(prevState => ({
        ...prevState,
        categories: prevState.categories.filter(cat => cat !== category),
      }));
    } else {
      // If category is not selected, add it
      setSelectedFilters(prevState => ({
        ...prevState,
        categories: [...prevState.categories, category],
      }));
    }
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaContainer>
        <ScrollView className="flex-1">
          {/* Navbar */}
          <View
            style={flex.flexCol}
            className="h-20 px-4 pb-2 pt-2 justify-start">
            <Text className="text-black text-xl font-bold">
              Perfect content creators
            </Text>
            <Text className="text-black text-xl font-bold">
              for your campaigns
            </Text>
          </View>

          {/* Search Bar */}
          <PageWithSearchBar>
            <View>
              <View style={flex.flexRow} className="pb-2 items-center px-4">
                <Pressable
                  onPress={() => setFilterModalState(true)}
                  style={flex.flexRow}
                  className="px-4 rounded-md border justify-start items-center">
                  <Filter width={15} height={15} color={COLOR.white} />
                  <Text style={font}>Filter</Text>
                </Pressable>
                <ScrollView horizontal style={styles.categoriesContainer}>
                  <View style={flex.flexRow} className="pt-1 gap-x-1">
                    {selectedFilters.categories &&
                      selectedFilters.categories.map((category, idx) => (
                        <View key={idx} style={styles.categoryContainer}>
                          <Text style={styles.category}>{category}</Text>
                        </View>
                      ))}
                  </View>
                </ScrollView>
              </View>

              <View style={flex.flexRow} className="px-4 justify-between">
                <View style={(flex.flexCol, gap.small)}>
                  {contentCreators.map((item, index) =>
                    index % 2 !== 0 ? (
                      <ContentCreatorCard
                        key={item.id?.toString()}
                        name={item.contentCreator?.fullname ?? ''}
                        categories={item.contentCreator?.specializedCategoryIds}
                        imageUrl={
                          item.contentCreator?.profilePicture ??
                          'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default-content-creator.jpeg?alt=media&token=ce612a34-4273-41cc-8365-c73195b97bad&_gl=1*1117w4m*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5OTQyNzUzNC41Ny4xLjE2OTk0Mjc2MTEuNDQuMC4w'
                        }
                      />
                    ) : null,
                  )}
                </View>
                <View style={(flex.flexCol, gap.small)}>
                  {contentCreators.map((item, index) =>
                    index % 2 === 0 ? (
                      <ContentCreatorCard
                        key={item.id?.toString()}
                        name={item.contentCreator?.fullname ?? ''}
                        categories={item.contentCreator?.specializedCategoryIds}
                        imageUrl={
                          item.contentCreator?.profilePicture ??
                          'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/default-content-creator.jpeg?alt=media&token=ce612a34-4273-41cc-8365-c73195b97bad&_gl=1*1117w4m*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5OTQyNzUzNC41Ny4xLjE2OTk0Mjc2MTEuNDQuMC4w'
                        }
                      />
                    ) : null,
                  )}
                </View>
              </View>
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
