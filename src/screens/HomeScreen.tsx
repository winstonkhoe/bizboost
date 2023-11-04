import {Button, Pressable, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {Campaign} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {useEffect, useState} from 'react';
import {User, UserRole} from '../model/User';
import {Text} from 'react-native';
import {useUser} from '../hooks/user';
import UserListCard from '../components/molecules/UserListCard';

const HomeScreen = () => {
  const {activeRole} = useUser();
  const navigation = useNavigation<NavigationStackProps>();

  const {campaigns} = useOngoingCampaign();

  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => {
    const unsubscribe = User.getAll(u => setUsers(u));

    return unsubscribe;
  }, []);

  return (
    <PageWithSearchBar>
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeRole !== UserRole.Admin ? (
          <>
            <View style={[flex.flexCol]}>
              <HorizontalPadding>
                <HomeSectionHeader
                  header="Recent Negotiations"
                  link="See All"
                />
              </HorizontalPadding>
              <View className="mt-3" />
              <HorizontalScrollView>
                {[...Array(10)].map((_item: any, index: number) => (
                  <RecentNegotiationCard key={index} />
                ))}
              </HorizontalScrollView>
            </View>
            <View className="mt-6" style={[flex.flexCol]}>
              <HorizontalPadding>
                <HomeSectionHeader header="Ongoing Campaigns" link="See All" />
              </HorizontalPadding>
              <View className="mt-3" />
              <HorizontalPadding>
                <View style={[flex.flexCol, gap.medium]}>
                  {campaigns.map((c: Campaign, index: number) => (
                    <OngoingCampaignCard campaign={c} key={index} />
                  ))}
                </View>
              </HorizontalPadding>
            </View>
          </>
        ) : (
          <View className="mt-6" style={[flex.flexCol]}>
            <HorizontalPadding>
              <HomeSectionHeader header="Users" link="See All" />
            </HorizontalPadding>
            <View />
            <HorizontalPadding>
              <View style={[flex.flexCol, gap.medium]}>
                {users.map((u, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      navigation.navigate(AuthenticatedNavigation.UserDetail, {
                        userId: u.id || '',
                      });
                    }}>
                    <UserListCard user={u} />
                  </Pressable>
                ))}
              </View>
            </HorizontalPadding>
          </View>
        )}

        <Button
          title="Create Campaign (Temp)"
          onPress={() =>
            navigation.navigate(AuthenticatedNavigation.CreateCampaign)
          }
        />
      </ScrollView>
    </PageWithSearchBar>
  );
};

export default HomeScreen;
