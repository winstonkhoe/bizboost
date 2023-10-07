import {View, Text} from 'react-native';
import Search from '../../assets/vectors/search.svg';

const SearchBar = () => {
  return (
    <View className="w-full h-10 flex flex-row justify-center items-center text-center">
      <View className="w-11/12 h-full flex flex-row">
        <View className="flex-1 h-full flex flex-row items-center p-3 bg-black/10 rounded-lg">
          <View className="flex h-full flex-row items-center mr-2">
            <Search width={14} />
          </View>
          <View className="w-full h-full">
            <Text className="text-black/40">David William</Text>
          </View>
        </View>
        <View className="h-full px-5 flex justify-center items-center">
          <Text className="text-black font-semibold text-xs">Search</Text>
        </View>
      </View>
    </View>
  );
};

export {SearchBar};
