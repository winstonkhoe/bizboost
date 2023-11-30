import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {StyleSheet, Text, useWindowDimensions} from 'react-native';
import {View} from 'react-native';
import {Campaign} from '../model/Campaign';
import {
  formatDateToDayMonthYearHourMinute,
  formatDateToHourMinute,
} from '../utils/date';
import {CustomButton} from '../components/atoms/Button';
import {useUser} from '../hooks/user';
import {
  Transaction,
  TransactionStatus,
  transactionStatusTypeMap,
} from '../model/Transaction';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';

import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {useNavigation} from '@react-navigation/native';
import {SocialPlatform, User} from '../model/User';
import {flex, items, justify} from '../styles/Flex';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';
import {LoadingScreen} from './LoadingScreen';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {background} from '../styles/BackgroundColor';
import {dimension} from '../styles/Dimension';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import StatusTag, {StatusType} from '../components/atoms/StatusTag';
import {ScrollView} from 'react-native-gesture-handler';
import {Label} from '../components/atoms/Label';
import {PlatformData} from './signup/RegisterSocialPlatform';
import {ChevronRight, PlatformIcon} from '../components/atoms/Icon';
import {formatNumberWithThousandSeparator} from '../utils/number';
import {CustomModal} from '../components/atoms/CustomModal';
import {SheetModal} from '../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../components/templates/BottomSheetModalWithTitle';
import {FormFieldHelper} from '../components/atoms/FormLabel';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {FormlessCustomTextInput} from '../components/atoms/Input';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.TransactionDetail
>;

const rules = {
  rejectReason: {
    min: 20,
    max: 500,
  },
};

const TransactionDetailScreen = ({route}: Props) => {
  // TODO: need to add expired validations (if cc still in previous step but the active step is ahead of it, should just show expired and remove all possibility of submission etc)
  const {uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const navigation = useNavigation<NavigationStackProps>();
  const {transactionId} = route.params;
  const [isRejectSheetModalOpen, setIsRejectSheetModalOpen] =
    useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(false);
  const isCampaignOwner = useMemo(() => {
    return campaign?.userId === uid;
  }, [campaign, uid]);

  useEffect(() => {
    Transaction.getById(transactionId).then(setTransaction);
  }, [transactionId]);

  useEffect(() => {
    if (transaction?.campaignId) {
      Campaign.getById(transaction.campaignId).then(setCampaign);
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction?.contentCreatorId) {
      User.getById(transaction?.contentCreatorId).then(setContentCreator);
    }
  }, [transaction]);

  const handleApprove = () => {
    if (transaction) {
      if (TransactionStatus.brainstormSubmitted === transaction.status) {
        setIsConfirmModalOpen(false);
        setIsLoading(true);
        transaction
          .approveBrainstorm()
          .catch(err => console.log(err))
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  const handleReject = () => {
    if (transaction && rejectReason.length > 0) {
      if (TransactionStatus.brainstormSubmitted === transaction.status) {
        setIsLoading(true);
        transaction
          .rejectBrainstorm(rejectReason)
          .then(() => {
            setIsRejectSheetModalOpen(false);
          })
          .catch(err => console.log(err))
          .finally(() => {
            setIsLoading(false);
          });
      }
    }
  };

  const closeRejectSheetModal = () => {
    setIsRejectSheetModalOpen(false);
    setRejectReason('');
  };

  const currentActiveTimeline = useMemo(() => {
    const now = new Date().getTime();
    return campaign?.timeline?.find(
      timeline => now >= timeline.start && now <= timeline.end,
    );
  }, [campaign]);

  if (!transaction || !campaign) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton
        fullHeight
        threshold={0}
        withoutScrollView
        backButtonPlaceholder={
          <Text
            className="font-bold"
            style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
            Transaction Detail
          </Text>
        }>
        <ScrollView
          bounces={true}
          alwaysBounceVertical
          style={[flex.flex1]}
          contentContainerStyle={[
            flex.flexCol,
            {paddingTop: safeAreaInsets.top + size.xlarge3},
            gap.default,
          ]}>
          <View style={[padding.default, flex.flexCol, gap.default]}>
            {transaction.status && (
              <View style={[flex.flexRow, justify.between, items.center]}>
                <Text
                  style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                  Status
                </Text>
                <StatusTag
                  fontSize={20}
                  status={transaction.status}
                  statusType={transactionStatusTypeMap[transaction.status]}
                />
              </View>
            )}
            {/* <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
              {transaction.status}
            </Text> */}
            {transaction.createdAt && (
              <>
                <View style={[styles.bottomBorder]} />
                <View style={[flex.flexRow, justify.between, items.center]}>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                    Transaction Date
                  </Text>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    {formatDateToDayMonthYearHourMinute(
                      new Date(transaction.createdAt),
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
          {!isCampaignOwner && (
            <>
              <Seperator />
              <View style={[flex.flexCol, padding.default, gap.default]}>
                <Text
                  className="font-bold"
                  style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                  Campaign Detail
                </Text>
                <View
                  style={[
                    flex.flexCol,
                    padding.default,
                    rounded.default,
                    border({
                      borderWidth: 1,
                      color: COLOR.black[20],
                    }),
                  ]}>
                  <View style={[flex.flexRow, gap.small]}>
                    <View
                      className="overflow-hidden"
                      style={[dimension.square.xlarge3, rounded.default]}>
                      <FastImage
                        source={{uri: campaign.image}}
                        style={[dimension.full]}
                      />
                    </View>
                    <Text
                      className="font-medium"
                      style={[
                        font.size[30],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={2}>
                      {campaign.title}
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
          {isCampaignOwner && (
            <>
              <Seperator />
              <View style={[flex.flexCol, padding.default, gap.default]}>
                <View style={[flex.flexRow, gap.xlarge, justify.between]}>
                  <Text
                    className="font-bold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    Content Creator Detail
                  </Text>
                  <View
                    style={[
                      flex.flex1,
                      flex.flexRow,
                      justify.end,
                      items.center,
                      gap.xsmall,
                    ]}>
                    <View
                      className="overflow-hidden"
                      style={[dimension.square.large, rounded.default]}>
                      <FastImage
                        source={{
                          uri: contentCreator?.contentCreator?.profilePicture,
                        }}
                        style={[dimension.full]}
                      />
                    </View>
                    <Text
                      className="font-medium"
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {contentCreator?.contentCreator?.fullname}
                    </Text>
                    <ChevronRight size="large" color={COLOR.text.neutral.med} />
                  </View>
                </View>
                <View
                  style={[
                    flex.flexCol,
                    gap.default,
                    padding.default,
                    rounded.default,
                    border({
                      borderWidth: 1,
                      color: COLOR.black[20],
                    }),
                  ]}>
                  <View style={[flex.flexCol, gap.default]}>
                    <View style={[flex.flexCol, gap.xsmall]}>
                      <Text
                        className="font-medium"
                        style={[
                          font.size[20],
                          textColor(COLOR.text.neutral.high),
                        ]}>
                        Specialized categories
                      </Text>
                      <View style={[flex.flexRow, flex.wrap, gap.xsmall]}>
                        {contentCreator?.contentCreator?.specializedCategoryIds
                          ?.slice(0, 3)
                          .map(categoryId => (
                            <Label
                              radius="small"
                              key={categoryId}
                              text={categoryId}
                            />
                          ))}
                      </View>
                    </View>
                    <View style={[flex.flexCol, gap.xsmall]}>
                      <Text
                        className="font-medium"
                        style={[
                          font.size[20],
                          textColor(COLOR.text.neutral.high),
                        ]}>
                        Usual posting schedules
                      </Text>
                      <View style={[flex.flexRow, flex.wrap, gap.xsmall]}>
                        {contentCreator?.contentCreator?.postingSchedules
                          ?.slice(0, 3)
                          .map(postingSchedule => (
                            <Label
                              radius="small"
                              key={postingSchedule}
                              text={formatDateToHourMinute(
                                new Date(postingSchedule),
                              )}
                            />
                          ))}
                      </View>
                    </View>
                  </View>
                  {(contentCreator?.instagram || contentCreator?.tiktok) && (
                    <>
                      <View style={[styles.bottomBorder]} />
                      <View
                        style={[
                          flex.flexRow,
                          flex.wrap,
                          gap.small,
                          justify.around,
                        ]}>
                        {contentCreator?.instagram && (
                          <SocialDetail
                            platformData={{
                              platform: SocialPlatform.Instagram,
                              data: contentCreator?.instagram,
                            }}
                          />
                        )}
                        {contentCreator?.tiktok && (
                          <SocialDetail
                            platformData={{
                              platform: SocialPlatform.Tiktok,
                              data: contentCreator?.tiktok,
                            }}
                          />
                        )}
                      </View>
                    </>
                  )}
                </View>
              </View>
            </>
          )}
          {transaction.status === TransactionStatus.brainstormSubmitted && (
            <>
              <Seperator />
              <View style={[flex.flexCol, padding.default, gap.medium]}>
                <View style={[flex.flexRow, gap.default, items.center]}>
                  <Text
                    className="font-semibold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    Brainstorm
                  </Text>
                  <StatusTag
                    status="Review needed"
                    statusType={StatusType.warning}
                  />
                </View>
                <View
                  style={[
                    flex.flexCol,
                    gap.default,
                    border({
                      borderWidth: 1,
                      color: COLOR.black[20],
                    }),
                    padding.default,
                    rounded.default,
                  ]}>
                  <Text
                    style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                    {formatDateToDayMonthYearHourMinute(
                      new Date(transaction?.getLatestBrainstorm()!!.createdAt),
                    )}
                  </Text>
                  <Text
                    style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
                    {transaction?.getLatestBrainstorm()?.content}
                  </Text>
                </View>
              </View>
            </>
          )}
        </ScrollView>
        <View
          style={[
            flex.flexRow,
            gap.default,
            padding.horizontal.medium,
            padding.top.default,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.medium),
            },
            styles.topBorder,
          ]}>
          <View style={[flex.flex1]}>
            <CustomButton
              text="Reject"
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
              onPress={() => {
                setIsRejectSheetModalOpen(true);
              }}
            />
          </View>
          <View style={[flex.flex1]}>
            <CustomButton
              text="Approve"
              onPress={() => {
                setIsConfirmModalOpen(true);
              }}
            />
          </View>
        </View>
      </PageWithBackButton>
      <SheetModal
        open={isRejectSheetModalOpen}
        onDismiss={closeRejectSheetModal}
        snapPoints={[windowDimension.height - safeAreaInsets.top]}
        disablePanDownToClose
        fullHeight
        enableHandlePanningGesture={false}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        enableDynamicSizing={false}>
        <BottomSheetModalWithTitle
          title={currentActiveTimeline?.step || ''}
          type="modal"
          onPress={closeRejectSheetModal}>
          <View style={[flex.grow, flex.flexCol, gap.medium]}>
            <View style={[flex.flex1, flex.flexCol, gap.default]}>
              <FormFieldHelper
                title="Reject reason"
                description="Provide rationale reason of why you are rejecting it"
              />
              <BottomSheetScrollView style={[flex.flex1]} bounces={false}>
                <FormlessCustomTextInput
                  type="textarea"
                  description={`Min. ${rules.rejectReason.min}, Max. ${rules.rejectReason.max} characters. `}
                  max={rules.rejectReason.max}
                  counter
                  onChange={setRejectReason}
                />
              </BottomSheetScrollView>
            </View>
            <CustomButton
              text="Submit"
              disabled={rejectReason.length < rules.rejectReason.min}
              onPress={handleReject}
            />
          </View>
        </BottomSheetModalWithTitle>
      </SheetModal>
      <CustomModal transparent={true} visible={isConfirmModalOpen}>
        <View style={[flex.flexCol, padding.default, gap.large]}>
          <View style={[flex.flexRow, justify.center, padding.medium]}>
            <Text
              className="text-center"
              style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
              Are you sure you want to approve{' '}
              <Text
                className="font-bold"
                style={[textColor(COLOR.text.neutral.high)]}>
                {contentCreator?.contentCreator?.fullname}
              </Text>{' '}
              {`${currentActiveTimeline?.step.toLocaleLowerCase()} ?`}
            </Text>
          </View>
          <View style={[flex.flexRow, gap.large, justify.center]}>
            <CustomButton
              text="Cancel"
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
              onPress={() => {
                setIsConfirmModalOpen(false);
              }}
            />
            <CustomButton text="Approve" onPress={handleApprove} />
          </View>
        </View>
      </CustomModal>
    </>
  );
};

export default TransactionDetailScreen;

const Seperator = () => {
  return (
    <View
      style={[
        background(COLOR.background.neutral.med),
        dimension.height.default,
      ]}
    />
  );
};

interface SocialDetailProps {
  platformData: PlatformData;
}

const SocialDetail = ({platformData}: SocialDetailProps) => {
  return (
    <View
      style={[
        flex.flex1,
        flex.flexCol,
        items.center,
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
        gap.small,
        rounded.default,
        padding.small,
      ]}>
      <View
        style={[
          flex.flex1,
          flex.flexRow,
          gap.small,
          items.center,
          rounded.small,
          background(COLOR.black[20]),
          padding.small,
        ]}>
        <PlatformIcon platform={platformData.platform} size="default" />
        <View style={[flex.flex1]}>
          <Text
            className="font-medium"
            style={[textColor(COLOR.text.neutral.high), font.size[10]]}
            numberOfLines={1}>{`@${platformData.data.username}`}</Text>
        </View>
      </View>
      {platformData.data.followersCount && (
        <View style={[flex.flexCol, items.center]}>
          <Text
            className="font-medium"
            style={[textColor(COLOR.text.neutral.high), font.size[20]]}>
            {formatNumberWithThousandSeparator(
              platformData.data.followersCount,
            )}
          </Text>
          <Text style={[textColor(COLOR.text.neutral.high), font.size[10]]}>
            Followers
          </Text>
        </View>
      )}
    </View>
  );
};

const ContentCreatorPage = () => {};

const BusinessPeoplePage = () => {};

const styles = StyleSheet.create({
  topBorder: {
    borderTopWidth: 1,
    borderTopColor: COLOR.black[10],
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[10],
  },
});
