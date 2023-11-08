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
import {useUser} from '../hooks/user';
import UserListCard from '../components/molecules/UserListCard';
import {TouchableOpacity} from 'react-native';
import {Text} from 'react-native';
import {FAB} from 'react-native-elements';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import Edit from '../assets/vectors/edit.svg';

const HomeScreen = () => {
  const {activeRole} = useUser();
  const navigation = useNavigation<NavigationStackProps>();

  const {campaigns} = useOngoingCampaign();

  const [users, setUsers] = useState<User[]>([]);

  // TODO: kalo klik see all apa mending pindah page?
  const [userLimit, setUserLimit] = useState(3);
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
            <View className="my-6" style={[flex.flexCol]}>
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
          <HorizontalPadding>
            <View className="my-4" style={[flex.flexCol]}>
              <HomeSectionHeader
                header="Users"
                link={userLimit === 3 ? 'See All' : 'Collapse'}
                onPressLink={() =>
                  setUserLimit(userLimit === 3 ? users.length : 3)
                }
              />
              <View style={[flex.flexCol, gap.medium]} className="mt-4">
                {users.slice(0, userLimit).map((u, index) => (
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
            </View>
          </HorizontalPadding>
        )}
      </ScrollView>
      {activeRole === UserRole.BusinessPeople && (
        <AnimatedPressable
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
          }}>
          <FAB
            onPress={() =>
              navigation.navigate(AuthenticatedNavigation.CreateCampaign)
            }
            size="small"
            color="#25A436"
            icon={<Edit width={20} height={20} color={'white'} />}
          />
        </AnimatedPressable>
      )}
    </PageWithSearchBar>
  );
};

export default HomeScreen;
