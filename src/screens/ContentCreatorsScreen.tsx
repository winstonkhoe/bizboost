import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, Text, TextInput, ScrollView, Pressable} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import SafeAreaContainer from '../containers/SafeAreaContainer';

import Search from '../assets/vectors/search.svg';
import Filter from '../assets/vectors/filter.svg';

import {flex} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';
import {gap} from '../styles/Gap';
import {User} from '../model/User';
import {background} from '../styles/BackgroundColor';
import {CustomButton} from '../components/atoms/Button';
import RangeSlider from '../components/atoms/RangeSlider';

const ContentCreatorsScreen: React.FC = () => {
  const [contentCreators, setContentCreators] = useState<User[]>([]);
  const [filterModalState, setFilterModalState] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    locations: [], // Store selected locations in an array
    minPrice: 0, // Set default minimum price
    maxPrice: 100, // Set default maximum price
    categories: [], // Store selected categories in an array
  });

  useEffect(() => {
    User.getContentCreators().then(contentCreatorsData =>
      setContentCreators(contentCreatorsData),
    );
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

  const handleCategoryPress = (category: string) => {
    setSelectedFilters(prevState => ({
      ...prevState,
      categories: [...prevState.categories, category],
    }));
  };

  const handleSliderChange = (values: {min: number; max: number}) => {
    // Perform actions with the updated min and max values
    console.log('New values:', values);
  };

  return (
    <BottomSheetModalProvider>
      <SafeAreaContainer>
        <ScrollView className="flex-1">
          {/* Navbar */}
          <View style={flex.flexCol} className="h-20 p-4 s justify-start">
            <Text className="text-black text-xl font-bold">
              Perfect content creators
            </Text>
            <Text className="text-black text-xl font-bold">
              for your campaigns
            </Text>
          </View>

          {/* Search Bar */}
          <View
            style={flex.flexRow}
            className="w-full p-4 items-center justify-between">
            <View
              style={flex.flexRow}
              className="bg-white items-center rounded-md py-1 px-3">
              <Search width={25} height={25} />
              <TextInput
                placeholder="Search content creator"
                className="bg-transparent p-2 rounded w-3/4"
              />
            </View>
            <Pressable
              onPress={() => setFilterModalState(true)}
              className="bg-black p-3 rounded-md">
              <Filter width={25} height={25} color={COLOR.white} />
            </Pressable>
          </View>

          {/* Product List */}
          <View style={flex.flexRow} className="px-4 justify-between">
            <View style={(flex.flexCol, gap.small)}>
              {contentCreators.map((item, index) =>
                index % 2 !== 0 ? (
                  <ContentCreatorCard
                    key={item.id?.toString()}
                    name={item.contentCreator?.fullname ?? ''}
                    imageUrl={
                      item.contentCreator?.profilePicture ??
                      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/download.jpg?alt=media&token=8d8b8037-192e-4a24-8c63-09806f0e10c5&_gl=1*1ka8hrk*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5ODIxNzIzMy4zNS4xLjE2OTgyMTcyNjEuMzIuMC4w'
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
                    imageUrl={
                      item.contentCreator?.profilePicture ??
                      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/download.jpg?alt=media&token=8d8b8037-192e-4a24-8c63-09806f0e10c5&_gl=1*1ka8hrk*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5ODIxNzIzMy4zNS4xLjE2OTgyMTcyNjEuMzIuMC4w'
                    }
                  />
                ) : null,
              )}
            </View>
          </View>
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
                  Choose price
                </Text>
                <RangeSlider
                  min={0}
                  max={10000}
                  onChange={handleSliderChange}
                />
              </View>
              <View>
                <Text className="text-lg font-bold text-black">
                  Choose category
                </Text>
              </View>
              <View className="py-4">
                <CustomButton text="Apply filters" rounded="default" />
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheetModal>
      </SafeAreaContainer>
    </BottomSheetModalProvider>
  );
};

export default ContentCreatorsScreen;
