import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
import {Pressable, StyleSheet, Text} from 'react-native';
import {View} from 'react-native';
import TagCard from '../../components/atoms/TagCard';
import {Campaign} from '../../model/Campaign';
import {formatDateToDayMonthYear} from '../../utils/date';
import {CustomButton} from '../../components/atoms/Button';
import {useUser} from '../../hooks/user';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';

import People from '../../assets/vectors/people.svg';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useNavigation} from '@react-navigation/native';
import CampaignPlatformAccordion from '../../components/molecules/CampaignPlatformAccordion';
import {User} from '../../model/User';
import {flex} from '../../styles/Flex';
import {horizontalPadding, verticalPadding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {textColor} from '../../styles/Text';
import {formatToRupiah} from '../../utils/currency';
import {LoadingScreen} from '../LoadingScreen';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {dimension} from '../../styles/Dimension';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {ChevronRight} from '../../components/atoms/Icon';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
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
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  // TODO: move to another screen? For Campaign's owner (business people), to check registered CC
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    const unsubscribe = Campaign.getByIdReactive(campaignId, c =>
      setCampaign(c),
    );

    return unsubscribe;
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
    User.getById(campaign?.userId || '').then(u => {
      if (u) {
        setBusinessPeople(u);
      }
    });
  }, [campaign]);

  const isCampaignOwner = useMemo(() => {
    return campaign?.userId === uid;
  }, [campaign, uid]);

  const handleJoinCampaign = () => {
    if (uid !== campaign?.userId) {
      const data = new Transaction({
        contentCreatorId: uid || '',
        campaignId: campaignId,
        businessPeopleId: campaign?.userId,
      });

      setIsLoading(true);
      data
        .register()
        .then(() => {
          showToast({
            message: 'Registration success',
            type: ToastType.success,
          });
        })
        .catch(err => {
          showToast({
            message: 'Registration failed',
            type: ToastType.danger,
          });
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  if (!campaign || businessPeople === undefined) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton fullHeight threshold={180}>
        <View className="flex-1">
          <View className="relative w-full h-72 overflow-hidden ">
            <FastImage
              className="w-full h-full object-cover"
              source={{uri: campaign.image}}
            />
            <LinearGradient
              colors={[COLOR.black[100], 'transparent']}
              style={[
                dimension.width.full,
                dimension.height.xlarge6,
                StyleSheet.absoluteFill,
              ]}
            />
          </View>
          <View className="flex flex-col p-4 gap-4">
            <View>
              <Text className="font-bold text-2xl mb-2">{campaign.title}</Text>
              <View className="flex flex-row justify-between">
                <Text className="font-bold text-xs">
                  {`${formatDateToDayMonthYear(
                    new Date(new Campaign(campaign).getTimelineStart().start),
                  )} - ${formatDateToDayMonthYear(
                    new Date(new Campaign(campaign).getTimelineEnd().end),
                  )}`}
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
                    {formatToRupiah(campaign.fee)}
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
                    <FastImage
                      className="w-full h-full object-cover"
                      source={getSourceOrDefaultAvatar({
                        uri: businessPeople.businessPeople?.profilePicture,
                      })}
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

                <ChevronRight color={COLOR.black[20]} />
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
                  {campaign.platformTasks && (
                    <View className="flex flex-col">
                      {campaign.platformTasks.map((p, index) => (
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
                type="secondary"
                text={
                  isMoreInfoVisible
                    ? 'Hide Information'
                    : 'Read More Information'
                }
                rounded="default"
                onPress={() => setIsMoreInfoVisible(value => !value)}
              />
            </View>
            {/* <Text>{transactionStatus}</Text> */}
            {!isCampaignOwner &&
              transactionStatus === TransactionStatus.notRegistered && (
                <View className="py-2" style={[flex.flexCol, gap.default]}>
                  {/* TODO: validate join only for CC */}

                  <CustomButton
                    text="Join Campaign"
                    rounded="default"
                    onPress={handleJoinCampaign}
                  />
                </View>
              )}
            <CustomButton
              text="Campaign Timeline"
              rounded="default"
              type="secondary"
              onPress={() =>
                navigation.navigate(AuthenticatedNavigation.CampaignTimeline, {
                  campaignId: campaignId,
                })
              }
            />
            {/* TODO: move to another screen? For Campaign's owner (business people), to check registered CC */}
            {isCampaignOwner && (
              <View className="">
                <CustomButton
                  customBackgroundColor={{
                    default: COLOR.background.neutral.high,
                    disabled: COLOR.background.neutral.disabled,
                  }}
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

            {/* {activeRole === UserRole.BusinessPeople && isCampaignOwner && (
              <View className="pb-2">
                <CustomButton
                  customBackgroundColor={
                    campaign.paymentProofImage
                      ? {
                          default: COLOR.background.neutral.high,
                          disabled: COLOR.background.neutral.disabled,
                        }
                      : {
                          default: COLOR.background.danger.high,
                          disabled: COLOR.background.danger.disabled,
                        }
                  }
                  customTextColor={
                    campaign.paymentProofImage
                      ? {
                          default: COLOR.text.neutral.high,
                          disabled: COLOR.text.neutral.disabled,
                        }
                      : {
                          default: COLOR.black[1],
                          disabled: COLOR.text.danger.disabled,
                        }
                  }
                  type="secondary"
                  text={
                    campaign.paymentProofImage
                      ? 'View Payment Proof'
                      : 'Complete Payment'
                  }
                  rounded="default"
                  onPress={() => setIsPaymentModalOpened(true)}
                />
              </View>
            )} */}
          </View>
        </View>
      </PageWithBackButton>
    </>
  );
};

export default CampaignDetailScreen;