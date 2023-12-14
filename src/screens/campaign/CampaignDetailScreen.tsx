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
import {
  Transaction,
  TransactionStatus,
  transactionStatusIndexMap,
} from '../../model/Transaction';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';

import People from '../../assets/vectors/people.svg';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useNavigation} from '@react-navigation/native';
import CampaignPlatformAccordion from '../../components/molecules/CampaignPlatformAccordion';
import {User} from '../../model/User';
import {flex, items, justify} from '../../styles/Flex';
import {
  horizontalPadding,
  padding,
  verticalPadding,
} from '../../styles/Padding';
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
import {ChevronRight, DateIcon} from '../../components/atoms/Icon';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {CollapsiblePanel} from '../transaction/TransactionDetailScreen';
import {font} from '../../styles/Font';
import {background} from '../../styles/BackgroundColor';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignDetail
>;

const CampaignDetailScreen = ({route}: Props) => {
  const {uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  // TODO: move to another screen? For Campaign's owner (business people), to check registered CC
  const [isMoreInfoVisible, setIsMoreInfoVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [approvedTransactionsCount, setApprovedTransactionsCount] = useState(0);

  useEffect(() => {
    Transaction.getAllTransactionsByCampaign(campaignId, transactions =>
      setApprovedTransactionsCount(
        transactions.filter(
          t =>
            transactionStatusIndexMap[t.status] >=
            transactionStatusIndexMap[TransactionStatus.registrationApproved],
        ).length,
      ),
    );
  }, [campaignId]);

  useEffect(() => {
    return Campaign.getByIdReactive(campaignId, setCampaign);
  }, [campaignId]);

  useEffect(() => {
    if (uid) {
      return Transaction.getTransactionByContentCreator(
        campaignId,
        uid,
        setTransaction,
      );
    }
  }, [campaignId, uid]);

  useEffect(() => {
    if (campaign?.userId) {
      User.getById(campaign?.userId).then(setBusinessPeople);
    }
  }, [campaign]);

  const isCampaignOwner = useMemo(() => {
    return campaign?.userId === uid;
  }, [campaign, uid]);

  const handleJoinCampaign = () => {
    if (uid !== campaign?.userId) {
      if (!uid) {
        showToast({
          message: 'Unknown error has occured',
          type: ToastType.info,
        });
        return;
      }

      const data = new Transaction({
        contentCreatorId: uid,
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

  const navigateToCampaignTimeline = () => {
    navigation.navigate(AuthenticatedNavigation.CampaignTimeline, {
      campaignId: campaignId,
    });
  };

  if (!campaign || businessPeople === undefined) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <View style={[flex.flex1, background(COLOR.background.neutral.default)]}>
        <PageWithBackButton fullHeight threshold={180}>
          <View className="flex-1">
            <View className="relative h-72 overflow-hidden ">
              <FastImage
                style={[dimension.full]}
                source={{uri: campaign.image}}
              />
              <LinearGradient
                colors={[COLOR.absoluteBlack[90], 'transparent']}
                style={[
                  dimension.width.full,
                  dimension.height.xlarge6,
                  StyleSheet.absoluteFill,
                ]}
              />
            </View>
            <View style={[flex.flexCol, padding.medium, gap.default]}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                {campaign.title}
              </Text>
              <View className="flex flex-row justify-between">
                <Pressable
                  style={[
                    flex.flexRow,
                    gap.small,
                    items.center,
                    padding.horizontal.default,
                    padding.vertical.small,
                    rounded.default,
                    border({
                      borderWidth: 1,
                      color: COLOR.green[60],
                    }),
                    background(COLOR.green[5]),
                  ]}
                  onPress={navigateToCampaignTimeline}>
                  <DateIcon size="medium" color={COLOR.green[60]} />
                  <Text
                    className="font-bold"
                    style={[font.size[20], textColor(COLOR.green[60])]}>
                    {`${formatDateToDayMonthYear(
                      new Date(
                        new Campaign(campaign).getTimelineStart()?.start,
                      ),
                    )} - ${formatDateToDayMonthYear(
                      // TODO: @win ini tadinya gaada tandatanya, dia error krn undefined si getTimeLineEnd
                      new Date(new Campaign(campaign).getTimelineEnd()?.end),
                    )}`}
                  </Text>
                  <ChevronRight size="medium" color={COLOR.green[60]} />
                </Pressable>
                <View style={[flex.flexRow, items.center, gap.small]}>
                  <People
                    width={20}
                    height={20}
                    color={COLOR.text.neutral.high}
                  />
                  <View
                    style={[
                      background(COLOR.black[20]),
                      rounded.default,
                      padding.horizontal.default,
                      padding.vertical.small,
                    ]}>
                    <Text
                      className="font-bold"
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {approvedTransactionsCount}/{campaign.slot}
                    </Text>
                  </View>
                </View>
              </View>

              {/* <Text className="font-semibold text-base pb-2">Criteria</Text> */}
              <View style={[flex.flexRow, flex.wrap, gap.small]}>
                {campaign.criterias &&
                  campaign.criterias.map((criteria: string, index: number) => (
                    <View key={index}>
                      <TagCard text={criteria} />
                    </View>
                  ))}
              </View>

              <Text style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
                {campaign.description}
              </Text>

              <View
                style={[
                  flex.flexRow,
                  flex.wrap,
                  justify.between,
                  items.center,
                ]}>
                <Text
                  className="font-semibold"
                  style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                  Fee
                </Text>
                {campaign.fee && (
                  <Text
                    className="font-medium"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    {formatToRupiah(campaign.fee)}
                  </Text>
                )}
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
                  className="text-center relative"
                  style={[
                    flex.flexRow,
                    horizontalPadding.default,
                    verticalPadding.default,
                    rounded.medium,
                    justify.between,
                    items.center,
                    border({
                      borderWidth: 1,
                      color: COLOR.black[20],
                    }),
                  ]}>
                  <View style={[flex.flexRow, items.center, gap.small]}>
                    <View
                      className="overflow-hidden"
                      style={[rounded.max, dimension.square.xlarge]}>
                      <FastImage
                        style={[dimension.full]}
                        source={getSourceOrDefaultAvatar({
                          uri: businessPeople.businessPeople?.profilePicture,
                        })}
                      />
                    </View>
                    <View className="flex flex-col">
                      <Text
                        className="font-semibold"
                        style={[
                          font.size[30],
                          textColor(COLOR.text.neutral.high),
                        ]}>
                        {businessPeople.businessPeople?.fullname}
                      </Text>
                    </View>
                  </View>

                  <ChevronRight color={COLOR.black[20]} />
                </Pressable>
              )}

              <View className="flex flex-col" style={[gap.medium]}>
                <View style={[flex.flexCol, gap.xsmall]}>
                  <Text
                    className="font-semibold pb-2"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    Important Information
                  </Text>
                  {campaign.importantInformation &&
                    campaign.importantInformation.map(
                      (importantInfo: string, index: number) => (
                        <View
                          key={index}
                          style={[flex.flexRow, items.center, gap.default]}>
                          <View
                            style={[
                              flex.flexRow,
                              justify.center,
                              items.center,
                              background(COLOR.background.neutral.med),
                              dimension.square.large,
                              rounded.max,
                            ]}>
                            <Text
                              className="font-bold"
                              style={[
                                font.size[20],
                                textColor(COLOR.text.neutral.high),
                              ]}>
                              i
                            </Text>
                          </View>
                          <Text
                            style={[
                              font.size[20],
                              textColor(COLOR.text.neutral.high),
                            ]}>
                            {importantInfo}
                          </Text>
                        </View>
                      ),
                    )}
                </View>

                <View style={[flex.flexCol, gap.small]}>
                  <Text
                    className="font-semibold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    Task Summary
                  </Text>
                  {campaign.platformTasks && (
                    <View style={[flex.flexCol]}>
                      {campaign.platformTasks.map((p, index) => (
                        <CampaignPlatformAccordion platform={p} key={index} />
                      ))}
                    </View>
                  )}
                </View>
                <View style={[flex.flexCol, gap.small]}>
                  <Text
                    className="font-semibold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    Location
                  </Text>
                  <View style={[flex.flexRow, flex.wrap, gap.small]}>
                    {campaign.locations &&
                      campaign.locations.map(
                        (location: string, index: number) => (
                          <TagCard key={index} text={location} />
                        ),
                      )}
                  </View>
                </View>
              </View>
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
        <View
          style={[
            flex.flexCol,
            gap.default,
            padding.top.default,
            padding.horizontal.default,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.default),
            },
          ]}>
          {!isCampaignOwner &&
            transaction?.status === TransactionStatus.notRegistered && (
              <CustomButton
                text="Join Campaign"
                rounded="default"
                onPress={handleJoinCampaign}
              />
            )}
          {isCampaignOwner && (
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
                  {
                    campaignId: campaignId,
                  },
                )
              }
            />
          )}
        </View>
      </View>
    </>
  );
};

export default CampaignDetailScreen;
