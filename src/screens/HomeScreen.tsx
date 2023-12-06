import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {RecentNegotiationCard} from '../components/molecules/RecentNegotiationCard';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {HomeSectionHeader} from '../components/molecules/SectionHeader';
import {HorizontalScrollView} from '../components/molecules/HorizontalScrollView';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {flex, justify} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {PageWithSearchBar} from '../components/templates/PageWithSearchBar';
import {Campaign} from '../model/Campaign';
import {useOngoingCampaign} from '../hooks/campaign';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../navigation/StackNavigation';
import {useEffect, useMemo, useState} from 'react';
import {User, UserRole} from '../model/User';
import {useUser} from '../hooks/user';
import UserListCard from '../components/molecules/UserListCard';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import Edit from '../assets/vectors/edit.svg';
import {Transaction} from '../model/Transaction';
import RegisteredUserListCard from '../components/molecules/RegisteredUserListCard';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {shadow} from '../styles/Shadow';
import {dimension} from '../styles/Dimension';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {textColor} from '../styles/Text';
import {size} from '../styles/Size';
import {Label} from '../components/atoms/Label';
import {formatDateToDayMonthYear} from '../utils/date';

const HomeScreen = () => {
  const {uid, activeRole} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const isAdmin = UserRole.Admin === activeRole;
  const isBusinessPeople = UserRole.BusinessPeople === activeRole;
  const isContentCreator = UserRole.ContentCreator === activeRole;

  const {userCampaigns, nonUserCampaigns} = useOngoingCampaign();
  const thisWeekCampaign = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const startOfWeek = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (day === 0 ? 6 : day - 1),
    );

    console.log(nonUserCampaigns);

    return nonUserCampaigns.filter(
      campaign =>
        new Campaign(campaign)?.getTimelineStart().start >=
        startOfWeek.getTime(),
    );
  }, [nonUserCampaigns]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // TODO: kalo klik see all apa mending pindah page?
  const [userLimit, setUserLimit] = useState(3);
  const [ongoingCampaignsLimit, setOngoingCampaignsLimit] = useState(3);
  useEffect(() => {
    console.log('homeScreen:userGetall');
    const unsubscribe = User.getAll(setUsers);
    return unsubscribe;
  }, []);

  useEffect(() => {
    console.log('homeScreen:getAllTransactionsByRole');
    const unsubscribe = Transaction.getAllTransactionsByRole(
      uid || '',
      activeRole!!,
      setTransactions,
    );

    return unsubscribe;
  }, [uid, activeRole]);

  return (
    <PageWithSearchBar>
      <ScrollView
        style={[flex.flex1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[padding.bottom.xlarge]}>
        <>
          <View style={[flex.flexCol, gap.large]}>
            {isContentCreator && (
              <View style={[flex.flexCol, gap.default]}>
                <HorizontalPadding>
                  <HomeSectionHeader header="New This Week" link="See All" />
                </HorizontalPadding>
                <HorizontalScrollView>
                  {thisWeekCampaign
                    .slice(0, 5)
                    .map((campaign: Campaign, index: number) => (
                      <AnimatedPressable
                        onPress={() => {
                          if (campaign.id) {
                            navigation.navigate(
                              AuthenticatedNavigation.CampaignDetail,
                              {
                                campaignId: campaign.id,
                              },
                            );
                          }
                        }}
                        key={index}
                        style={[flex.flexCol, dimension.square.xlarge9]}>
                        <View
                          className="overflow-hidden"
                          style={[StyleSheet.absoluteFill, rounded.large]}>
                          <FastImage
                            style={[dimension.full]}
                            source={{
                              uri: campaign.image,
                            }}
                          />
                        </View>
                        <View
                          className="overflow-hidden"
                          style={[
                            StyleSheet.absoluteFill,
                            rounded.large,
                            background(COLOR.black[100], 0.4),
                          ]}
                        />
                        <View
                          className="overflow-hidden"
                          style={[
                            StyleSheet.absoluteFill,
                            flex.flexCol,
                            justify.end,
                            padding.default,
                          ]}>
                          <View
                            style={[
                              flex.flexCol,
                              gap.xsmall,
                              {
                                minHeight: size.xlarge2,
                              },
                              // padding.bottom.small,
                            ]}>
                            <Text
                              className="font-bold"
                              style={[font.size[20], textColor(COLOR.black[0])]}
                              numberOfLines={1}>
                              {campaign?.title}
                            </Text>
                            <Text
                              className="font-medium"
                              style={[font.size[20], textColor(COLOR.black[0])]}
                              numberOfLines={2}>
                              {campaign?.description}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="overflow-hidden"
                          style={[
                            padding.default,
                            {
                              position: 'absolute',
                              top: size.xsmall2,
                              right: size.xsmall2,
                            },
                          ]}>
                          <Label
                            radius="default"
                            text={`Until ${formatDateToDayMonthYear(
                              new Date(
                                new Campaign(campaign).getTimelineStart().end,
                              ),
                            )}`}
                          />
                        </View>
                      </AnimatedPressable>
                    ))}
                </HorizontalScrollView>
              </View>
            )}
            <View style={[flex.flexCol, gap.default]}>
              <HorizontalPadding>
                <HomeSectionHeader
                  header="Recent Negotiations"
                  link="See All"
                />
              </HorizontalPadding>
              <HorizontalScrollView>
                {[...Array(10)].map((_item: any, index: number) => (
                  <RecentNegotiationCard key={index} />
                ))}
              </HorizontalScrollView>
            </View>
            {isBusinessPeople && (
              <View style={[flex.flexCol, gap.default]}>
                <HorizontalPadding>
                  <HomeSectionHeader
                    header="Ongoing Campaigns"
                    link={ongoingCampaignsLimit === 3 ? 'See All' : 'Collapse'}
                    onPressLink={() =>
                      setOngoingCampaignsLimit(
                        ongoingCampaignsLimit === 3 ? userCampaigns.length : 3,
                      )
                    }
                  />
                </HorizontalPadding>
                <View
                  style={[
                    flex.flexCol,
                    gap.medium,
                    padding.horizontal.default,
                  ]}>
                  {userCampaigns
                    .slice(0, ongoingCampaignsLimit)
                    .map((c: Campaign, index: number) => (
                      <OngoingCampaignCard campaign={c} key={index} />
                    ))}
                </View>
              </View>
            )}
            <View style={[flex.flexCol, gap.default]}>
              <HorizontalPadding>
                <HomeSectionHeader
                  header="Ongoing Transactions"
                  link={'See All'}
                  // onPressLink={() =>
                  // setOngoingCampaignsLimit(
                  //   ongoingCampaignsLimit === 3 ? userCampaigns.length : 3,
                  // )
                  // }
                />
              </HorizontalPadding>
              <View
                style={[flex.flexCol, gap.medium, padding.horizontal.default]}>
                {transactions.map((t, index) => (
                  <RegisteredUserListCard
                    key={index}
                    transaction={t}
                    role={activeRole}
                  />
                ))}
              </View>
            </View>
          </View>
        </>
        {isAdmin && (
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
      {isBusinessPeople && (
        <View
          style={[
            {
              position: 'absolute',
              bottom: 20,
              right: 20,
            },
          ]}>
          <AnimatedPressable
            onPress={() =>
              navigation.navigate(AuthenticatedNavigation.CreateCampaign)
            }>
            <View
              style={[
                shadow.large,
                background(COLOR.green[50]),
                padding.default,
                rounded.max,
              ]}>
              <Edit width={20} height={20} color={'white'} />
            </View>
          </AnimatedPressable>
        </View>
      )}
    </PageWithSearchBar>
  );
};

export default HomeScreen;
