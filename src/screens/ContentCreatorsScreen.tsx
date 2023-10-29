import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Search from '../assets/vectors/search.svg';
import Filter from '../assets/vectors/filter.svg';
import {flex} from '../styles/Flex';
import {COLOR} from '../styles/Color';
import ContentCreatorCard from '../components/atoms/ContentCreatorCard';
import {gap} from '../styles/Gap';
import {User} from '../model/User';

const ContentCreatorsScreen: React.FC = () => {
  const [contentCreators, setContentCreators] = useState<User[]>([]);

  useEffect(() => {
    User.getContentCreators().then(contentCreatorsData =>
      setContentCreators(contentCreatorsData),
    );
  }, []);

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
                key={item.id?.toString()}
                name={item.contentCreator?.fullname ?? ''}
                imageUrl={
                  item.contentCreator?.profilePicture ??
                  'https://i.ytimg.com/vi/2GKdnpFhtQE/maxresdefault.jpg'
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
                  'https://i.ytimg.com/vi/2GKdnpFhtQE/maxresdefault.jpg'
                }
              />
            ) : null,
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ContentCreatorsScreen;
