import {Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import InfluencerCard from '../components/atoms/InfluencerCard';
import SafeAreaContainer from '../containers/SafeAreaContainer';
const HomeScreen = () => {
  return (
    <SafeAreaContainer>
      <View className="container h-full flex-col text-center">
        <View className="w-full h-10 flex justify-center items-center">
          <Text>Influencers</Text>
        </View>
        <View className="h-full w-full">
          <ScrollView className="w-full">
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
