import {Button, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {Campaign, CampaignType} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  RootAuthenticatedNavigationStackProps,
} from '../navigation/AuthenticatedNavigation';

const HomeScreen = () => {
  const navigation = useNavigation<RootAuthenticatedNavigationStackProps>();

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
                  <OngoingCampaignCard campaign={c} key={index} />
                ))}
              </View>
            </HorizontalPadding>
          </View>
          {/* <Button
            title="Test"
            onPress={() => {
              const campaign = new Campaign(
                'Sn6HYcvx8YPnbjalnaLPSrh8PHf1',
                'Test',
                'lorem ipsum',
                CampaignType.Public,
                ['Bandung', 'Pontianak'],
                [{name: 'Instagram', tasks: ['3 reels']}],
                150000,
                ['ganteng', 'cantik', 'tidak sombong'],
                2,
                'https://lh3.googleusercontent.com/p/AF1QipMvoZtSgC5aguviGyul1KfeSIR0w1HBROdlMmit=w1080-h608-p-no-v0',
                new Date().getSeconds(),
                new Date('12-12-2023').getSeconds(),
                new Date().getSeconds(),
                ['harus begini', 'ga boleh begitu'],
              );

              campaign.insert().then(v => console.log(`Insert campaign: ${v}`));
            }}
          /> */}

          <Button
            title="Create Campaign (Temp)"
            onPress={() =>
              navigation.navigate(AuthenticatedNavigation.CreateCampaign)
            }
          />
        </ScrollView>
      </View>
    </PageWithSearchBar>
  );
};

export default HomeScreen;
