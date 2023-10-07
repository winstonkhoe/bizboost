import {Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import InfluencerCard from '../components/atoms/InfluencerCard';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {SearchBar} from '../components/atoms/SearchBar';
import {InternalLink} from '../components/atoms/Link';
import {RecentNegotiationCard} from '../components/atoms/RecentNegotiationCard';
const HomeScreen = () => {
  return (
    <SafeAreaContainer>
      <View className="container h-full flex flex-col text-center">
        <SearchBar />
        <View className="h-full w-full">
          <ScrollView className="w-full">
            <View className="mt-4 w-full flex flex-col items-center">
              <View className="relative w-11/12 flex flex-col">
                <View className="w-full flex flex-row items-center justify-between">
                  <Text className="text-lg font-bold">Recent Negotiations</Text>
                  <InternalLink text="See All" />
                </View>
                <View className="flex flex-row">
                  <ScrollView
                    className="w-full"
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}>
                    {[...Array(10)].map((_item: any, index: number) => (
                      <RecentNegotiationCard key={index} />
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            <View className="flex flex-row flex-wrap justify-around p-4 gap-4">
              {[...Array(10)].map((_item: any, index: number) => (
                <InfluencerCard
                  key={index}
                  index={index}
                  image={require('../assets/images/sample-influencer.jpeg')}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default HomeScreen;
