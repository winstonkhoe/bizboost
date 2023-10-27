import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Search from '../assets/vectors/search.svg';
import Filter from '../assets/vectors/filter.svg';
import {flex} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';
import MasonryList from '@react-native-seoul/masonry-list';
import {FlatList} from 'react-native-gesture-handler';
import {gap} from '../styles/Gap';

const contentCreators = [
  {
    id: 1,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/download.jpg?alt=media&token=8d8b8037-192e-4a24-8c63-09806f0e10c5&_gl=1*1ka8hrk*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5ODIxNzIzMy4zNS4xLjE2OTgyMTcyNjEuMzIuMC4w',
  },
  {
    id: 2,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
  {
    id: 3,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/Foto%20Besar.jpg?alt=media&token=be92d3cb-4ccb-419e-b6f5-27ebb6db2c00&_gl=1*1sha3yk*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5ODIxNzIzMy4zNS4xLjE2OTgyMTg0MDguMzYuMC4w',
  },
  {
    id: 4,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/download.jpg?alt=media&token=8d8b8037-192e-4a24-8c63-09806f0e10c5&_gl=1*1ka8hrk*_ga*MTQ2MjU4MzIzNC4xNjk2NjQ4NTYx*_ga_CW55HF8NVT*MTY5ODIxNzIzMy4zNS4xLjE2OTgyMTcyNjEuMzIuMC4w',
  },
  {
    id: 5,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
  {
    id: 6,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
  {
    id: 7,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
  {
    id: 8,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
  {
    id: 9,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
  {
    id: 10,
    name: 'Kesya Amanda',
    imageUrl:
      'https://firebasestorage.googleapis.com/v0/b/endorse-aafdb.appspot.com/o/1cbd2471-20e9-446b-b3a6-788e8df2131f.jpeg?alt=media&token=703f56cb-b557-4b47-9a34-81ca49531e04',
  },
];

const ContentCreatorsScreen: React.FC = () => {
  return (
    <ScrollView className="flex-1">
      {/* Navbar */}
      <View style={flex.flexCol} className="h-20 p-4 s justify-start">
        <Text className="text-black text-xl font-bold">
          Perfect content creators
        </Text>
        <Text className="text-black text-xl font-bold">for your campaigns</Text>
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
        <TouchableOpacity className="bg-black p-3 rounded-md">
          <Filter width={25} height={25} color={COLOR.white} />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <View style={flex.flexRow} className="px-4 justify-between items-center">
        <View style={(flex.flexCol, gap.small)}>
          {contentCreators.map((item, index) =>
            index % 2 !== 0 ? (
              <ContentCreatorCard
                key={item.id.toString()}
                name={item.name}
                imageUrl={item.imageUrl}
              />
            ) : null,
          )}
        </View>
        <View style={(flex.flexCol, gap.small)}>
          {contentCreators.map((item, index) =>
            index % 2 === 0 ? (
              <ContentCreatorCard
                key={item.id.toString()}
                name={item.name}
                imageUrl={item.imageUrl}
              />
            ) : null,
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ContentCreatorsScreen;
