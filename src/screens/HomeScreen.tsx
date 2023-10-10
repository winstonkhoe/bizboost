import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import SafeAreaContainer from '../containers/SafeAreaContainer';
import {SearchBar} from '../components/organisms/SearchBar';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootAuthenticatedStackParamList} from '../navigation/AuthenticatedNavigation';

type Props = NativeStackScreenProps<RootAuthenticatedStackParamList, 'Home'>;
const HomeScreen = (props: Props) => {
  return (
    <SafeAreaContainer>
      <View className="h-full text-center" style={[flex.flexCol]}>
        <HorizontalPadding>
          <SearchBar />
        </HorizontalPadding>
        <View className="mb-6" />
        <View className="h-full w-full">
          <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
            <View className="w-full flex flex-col items-center">
              <HorizontalPadding>
                <HomeSectionHeader
                  header="Recent Negotiations"
                  link="See All"
                />
              </HorizontalPadding>
              <View className="mt-3 w-full" />
              <HorizontalScrollView>
                {[...Array(10)].map((_item: any, index: number) => (
                  <RecentNegotiationCard key={index} />
                ))}
              </HorizontalScrollView>
            </View>
            <View className="mt-6 w-full items-center" style={[flex.flexCol]}>
              <HorizontalPadding>
                <HomeSectionHeader header="Ongoing Campaigns" link="See All" />
              </HorizontalPadding>
              <View className="mt-3 w-full" />
              <HorizontalPadding>
                <View style={[flex.flexCol, gap.medium]}>
                  {[...Array(10)].map((_item: any, index: number) => (
                    <OngoingCampaignCard
                      navigation={props.navigation}
                      route={props.route}
                      key={index}
                    />
                  ))}
                </View>
              </HorizontalPadding>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaContainer>
  );
};

export default HomeScreen;
