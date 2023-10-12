import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootAuthenticatedStackParamList} from '../navigation/AuthenticatedNavigation';
import {Campaign} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';

type Props = NativeStackScreenProps<RootAuthenticatedStackParamList, 'Home'>;
const HomeScreen = (props: Props) => {
  const {campaigns} = useOngoingCampaign();

  return (
    <PageWithSearchBar>
      <View className="h-full w-full">
        <ScrollView className="w-full" showsVerticalScrollIndicator={false}>
          <View className="w-full flex flex-col items-center">
            <HorizontalPadding>
              <HomeSectionHeader header="Recent Negotiations" link="See All" />
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
                {campaigns.map((c: Campaign, index: number) => (
                  <OngoingCampaignCard
                    campaign={c}
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
    </PageWithSearchBar>
  );
};

export default HomeScreen;
