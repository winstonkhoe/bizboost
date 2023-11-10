import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {Pressable, Text} from 'react-native';
import {View} from 'react-native';
import {Image} from 'react-native';
import TagCard from '../components/atoms/TagCard';
import {Campaign} from '../model/Campaign';
import {getDate} from '../utils/date';
import {CustomButton} from '../components/atoms/Button';
import {useUser} from '../hooks/user';
import {Transaction, TransactionStatus} from '../model/Transaction';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';

import People from '../assets/vectors/people.svg';
import ChevronRight from '../assets/vectors/chevron-right.svg';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {useNavigation} from '@react-navigation/native';
import CampaignPlatformAccordion from '../components/molecules/CampaignPlatformAccordion';
import {User} from '../model/User';
import {flex} from '../styles/Flex';
import {horizontalPadding, verticalPadding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignDetail
>;

const CampaignDetailScreen = ({route}: Props) => {
  const {uid} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.notRegistered,
  );
  const [businessPeople, setBusinessPeople] = useState<User | undefined>();
  // TODO: move to another screen? For Campaign's owner (business people), to check registered CC
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);

  const [approvedTransactionsCount, setApprovedTransactionsCount] = useState(0);

  useEffect(() => {
    Transaction.getAllTransactionsByCampaign(campaignId, transactions =>
      setApprovedTransactionsCount(
        transactions.filter(
          t => t.status === TransactionStatus.registrationApproved,
        ).length,
      ),
    );
  }, [campaignId]);

  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  useEffect(() => {
    const unsubscribe = Transaction.getTransactionStatusByContentCreator(
      campaignId,
      uid || '',

      status => {
        setTransactionStatus(status);
      },
    );

    return unsubscribe;
  }, [campaignId, uid]);

  useEffect(() => {
    User.getById(campaign?.userId || '').then(u => setBusinessPeople(u));
  }, [campaign]);

  const userIsCampaignOwner = () => {
    return campaign?.userId === uid;
  };

  // TODO: validate join only for CC
  const handleJoinCampaign = () => {
    const data = new Transaction({
      contentCreatorId: uid || '',
      campaignId: campaignId,
      status: TransactionStatus.registrationPending,
    });

    data.insert().then(isSuccess => {
      if (isSuccess) {
        console.log('Joined!');
      }
    });
  };

  if (!campaign) {
    return <Text>Loading</Text>;
  }

  return (
    <PageWithBackButton>
      <View className="w-full pt-4">
        <View className="w-full h-60 overflow-hidden ">
          <Image
            className="w-full h-full object-cover"
            source={{uri: campaign.image}}
          />
        </View>
        <View className="flex flex-col p-4 gap-4">
          <View>
            <Text className="font-bold text-2xl mb-2">{campaign.title}</Text>
            <View className="flex flex-row justify-between">
              <Text className="font-bold text-xs">
                {campaign.start &&
                  getDate(campaign.start).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                -{' '}
                {campaign.end &&
                  getDate(campaign.end).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
              </Text>
              <View className="flex flex-row items-center">
                <People width={20} height={20} />
                <View className="ml-2 bg-gray-300 py-1 px-2 rounded-md min-w-12">
                  <Text className="text-center text-xs font-bold">
                    {approvedTransactionsCount}/{campaign.slot}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View>
            {/* <Text className="font-semibold text-base pb-2">Criteria</Text> */}
            <View className="flex flex-row flex-wrap gap-2">
              {campaign.criterias &&
                campaign.criterias.map((_item: any, index: number) => (
                  <View key={index}>
                    <TagCard text={_item} />
                  </View>
                ))}
            </View>
          </View>

          <Text>{campaign.description}</Text>

          <View className="flex flex-row items-center justify-between flex-wrap ">
            <Text className="font-semibold text-base">Fee</Text>
            <View>
              {campaign.fee && (
                <Text className="font-medium ">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                  }).format(campaign.fee)}
                </Text>
              )}
            </View>
          </View>

          {/* TODO: extract component */}
          {businessPeople && (
            <Pressable
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.BusinessPeopleDetail,
                  {businessPeopleId: `${businessPeople.id}`},
                );
              }}
              className="justify-between items-center text-center relative"
              style={[
                flex.flexRow,
                horizontalPadding.default,
                verticalPadding.default,
                rounded.default,
                border({
                  borderWidth: 1,
                  color: COLOR.background.neutral.disabled,
                }),
              ]}>
              <View className="flex flex-row items-center">
                <View
                  className="mr-2 w-12 h-12 items-center justify-center overflow-hidden"
                  style={[flex.flexRow, rounded.max]}>
                  <Image
                    className="w-full h-full object-cover"
                    source={
                      businessPeople.businessPeople?.profilePicture
                        ? {
                            uri: businessPeople.businessPeople?.profilePicture,
                          }
                        : require('../assets/images/bizboost-avatar.png')
                    }
                  />
                </View>
                <View className="flex flex-col">
                  <Text className="font-semibold">
                    {businessPeople.businessPeople?.fullname}
                  </Text>
                  <Text
                    className="text-xs"
                    style={[textColor(COLOR.black[30])]}>
                    Subtitle
                  </Text>
                </View>
              </View>

              <ChevronRight fill={COLOR.black[20]} />
            </Pressable>
          )}

          {isMoreInfoVisible && (
            <View className="flex flex-col" style={[gap.medium]}>
              <View className="">
                <Text className="font-semibold text-base pb-2">
                  Important Information
                </Text>
                {campaign.importantInformation &&
                  campaign.importantInformation.map(
                    (_item: any, index: number) => (
                      <View
                        key={index}
                        className="mb-2 flex flex-row items-center">
                        <View className="bg-gray-300 py-1 px-[11px] rounded-full mr-2">
                          <Text className="text-center text-xs">i</Text>
                        </View>
                        <Text>{_item}</Text>
                      </View>
                    ),
                  )}
              </View>

              <View className="">
                <Text className="font-semibold text-base pb-2">
                  Task Summary
                </Text>
                {campaign.platforms && (
                  <View className="flex flex-col">
                    {campaign.platforms.map((p, index) => (
                      <CampaignPlatformAccordion platform={p} key={index} />
                    ))}
                  </View>
                )}
              </View>
              <View className="">
                <Text className="font-semibold text-base pb-2">Location</Text>
                <View className="flex flex-row flex-wrap gap-2">
                  {campaign.locations &&
                    campaign.locations.map((_item: any, index: number) => (
                      <View key={index}>
                        <TagCard text={_item} />
                      </View>
                    ))}
                </View>
              </View>
            </View>
          )}
          <View>
            <CustomButton
              customBackgroundColor={COLOR.background.neutral}
              customTextColor={COLOR.text.neutral}
              verticalPadding="small"
              type="secondary"
              text={
                isMoreInfoVisible ? 'Hide Information' : 'Read More Information'
              }
              rounded="default"
              onPress={() => setIsMoreInfoVisible(value => !value)}
            />
          </View>
          {/* <Text>{transactionStatus}</Text> */}
          {!userIsCampaignOwner() &&
            transactionStatus === TransactionStatus.notRegistered && (
              <View className="py-2">
                {/* TODO: validate join only for CC */}

                <CustomButton
                  text="Join Campaign"
                  rounded="default"
                  onPress={handleJoinCampaign}
                />
              </View>
            )}
          {/* TODO: move to another screen? For Campaign's owner (business people), to check registered CC */}
          {userIsCampaignOwner() && (
            <View className="py-2">
              <CustomButton
                customBackgroundColor={COLOR.background.neutral}
                customTextColor={COLOR.text.neutral}
                text="View Registrants"
                rounded="default"
                onPress={() =>
                  navigation.navigate(
                    AuthenticatedNavigation.CampaignRegistrants,
                    {campaignId: campaignId},
                  )
                }
              />
              {/* {transactions.map((t, index) => (
                  <RegisteredUserListCard transaction={t} key={index} />
                ))} */}
            </View>
          )}
        </View>
      </View>
    </PageWithBackButton>
  );
};

export default CampaignDetailScreen;
