import React from 'react';
import {View, Text, TextInput, TouchableOpacity, FlatList} from 'react-native';
import Search from '../assets/vectors/search.svg';
import Filter from '../assets/vectors/filter.svg';
import {flex} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';

const contentCreators = [
  {
    id: 1,
    name: 'Kesya',
    imageUrl: '',
  },
];

const ContentCreatorsScreen: React.FC = () => {
  return (
    <View className="flex-1">
      {/* Navbar */}
      <View className="h-16 px-2 py-4 flex-row items-center justify-between">
        <Text className="text-black text-lg font-bold">
          All Content Creators
        </Text>
        <TouchableOpacity>
          <Filter width={20} height={20} color={COLOR.black[100]} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View
        style={flex.flexRow}
        className="w-full p-2 items-center justify-between">
        <TextInput
          placeholder="Search products"
          className="bg-gray-200 p-2 rounded w-11/12"
        />
        <Search width={16} height={16} />
      </View>

      {/* Product List */}
      <FlatList
        data={contentCreators}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        renderItem={({item}) => (
          <ContentCreatorCard name={item.name} imageUrl={item.imageUrl} />
        )}
      />
    </View>
  );
};

export default ContentCreatorsScreen;
