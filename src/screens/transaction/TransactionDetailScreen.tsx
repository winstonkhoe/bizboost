import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
import {Pressable, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {View} from 'react-native';
import {Campaign, CampaignStep} from '../../model/Campaign';
import {
  formatDateToDayMonthYear,
  formatDateToDayMonthYearHourMinute,
} from '../../utils/date';
import {CustomButton} from '../../components/atoms/Button';
import {useUser} from '../../hooks/user';
import {
  Brainstorm,
  Content,
  PaymentStatus,
  Engagement,
  Transaction,
  TransactionStatus,
  basicStatusTypeMap,
  transactionStatusCampaignStepMap,
  transactionStatusTypeMap,
  paymentStatusTypeMap,
} from '../../model/Transaction';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import InfoIcon from '../../assets/vectors/info.svg';

import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useNavigation} from '@react-navigation/native';
import {User, UserRole} from '../../model/User';
import {flex, items, justify, self} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {textColor} from '../../styles/Text';
import {LoadingScreen} from '../LoadingScreen';
import FastImage from 'react-native-fast-image';
import {font, text} from '../../styles/Font';
import {background} from '../../styles/BackgroundColor';
import {dimension} from '../../styles/Dimension';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import StatusTag, {StatusType} from '../../components/atoms/StatusTag';
import {ScrollView} from 'react-native-gesture-handler';
import {
  ChevronRight,
  CopyIcon,
  MeatballMenuIcon,
  OpenIcon,
  PlatformIcon,
  ReportIcon,
} from '../../components/atoms/Icon';
import WarningIcon from '../../assets/vectors/warning-circle.svg';
import CheckmarkIcon from '../../assets/vectors/checkmark-circle.svg';
import CrossIcon from '../../assets/vectors/cross-circle.svg';

import {SheetModal} from '../../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../../components/templates/BottomSheetModalWithTitle';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {FormlessCustomTextInput} from '../../components/atoms/Input';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {AnimatedPressable} from '../../components/atoms/AnimatedPressable';
import {formatToRupiah} from '../../utils/currency';
import {campaignTaskToString} from '../../utils/campaign';
import {ModalWebView} from '../modals/ModalWebView';
import Clipboard from '@react-native-clipboard/clipboard';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Seperator} from '../../components/atoms/Separator';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {EmptyPlaceholder} from '../../components/templates/EmptyPlaceholder';
import PaymentSheetModal from '../../components/molecules/PaymentSheetModal';
import {BackButtonLabel} from '../../components/atoms/Header';
import ImageView from 'react-native-image-viewing';
import {CustomAlert} from '../../components/molecules/CustomAlert';
import {Report, ReportType, reportTypeLabelMap} from '../../model/Report';
import PagerView from 'react-native-pager-view';
import {InternalLink} from '../../components/atoms/Link';
import {ContentCreatorSection} from '../../components/molecules/ContentCreatorSection';
import {overflow} from '../../styles/Overflow';
import {position} from '../../styles/Position';
import {Offer} from '../../model/Offer';
import {SkeletonPlaceholder} from '../../components/molecules/SkeletonPlaceholder';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.TransactionDetail
>;

const TransactionDetailScreen = ({route}: Props) => {
  // TODO: mungkin bisa accept / reject dari sini juga (view payment proof & status jg bisa)
  // TODO: need to add expired validations (if cc still in previous step but the active step is ahead of it, should just show expired and remove all possibility of submission etc)
  const {uid, user, activeRole} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const {transactionId} = route.params;
  const [isOthersSheetModalOpen, setIsOthersSheetModalOpen] =
    useState<boolean>(false);
  const [reportIndex, setReportIndex] = useState(0);
  const [isReportSheetModalOpen, setIsReportSheetModalOpen] =
    useState<boolean>(false);
  const reportViewPagerRef = useRef<PagerView>(null);
  const [reportDescription, setReportDescription] = useState<string>('');
  const [transactionReports, setTransactionReports] = useState<Report[]>([]);
  const [selectedReportType, setSelectedReportType] = useState<ReportType>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [transaction, setTransaction] = useState<Transaction | null>();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(false);
  const isCampaignOwner = useMemo(() => {
    return campaign?.userId === uid;
  }, [campaign, uid]);

  useEffect(() => {
    return Transaction.getById(transactionId, setTransaction);
  }, [transactionId]);

  useEffect(() => {
    if (transaction?.campaignId) {
      Campaign.getById(transaction.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction?.contentCreatorId) {
      User.getById(transaction?.contentCreatorId).then(setContentCreator);
    }
    if (transaction?.businessPeopleId) {
      User.getById(transaction?.businessPeopleId).then(setBusinessPeople);
    }
  }, [transaction]);

  const updateReportDescription = useCallback((description: string) => {
    setReportDescription(description);
  }, []);

  useEffect(() => {
    if (transactionId && uid) {
      return Report.getByTransactionIdAndReporterId(
        transactionId,
        uid,
        setTransactionReports,
      );
    }
  }, [transactionId, uid]);

  const handleApprove = () => {
    if (!transaction) {
      return;
    }
    if (transaction.status === TransactionStatus.registrationPending) {
      setIsPaymentModalOpened(true);
      return;
    }
    setIsLoading(true);
    transaction
      .approve()
      .then(() => {
        showToast({
          message: 'Transaction Approved!',
          type: ToastType.success,
        });
      })
      .catch(err => {
        showToast({
          message: 'Failed to approve transaction',
          type: ToastType.danger,
        });
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleReject = () => {
    if (transaction && transaction.id) {
      setIsOthersSheetModalOpen(false);
      navigation.navigate(AuthenticatedNavigation.RejectTransaction, {
        transactionId: transaction.id,
      });
    }
  };

  const navigateToReportList = () => {
    setIsReportSheetModalOpen(false);
    navigation.navigate(AuthenticatedNavigation.ReportList);
  };

  const closeOthersSheetModal = () => {
    setIsOthersSheetModalOpen(false);
  };
  const onRequestWithdraw = () => {
    transaction
      ?.requestWithdrawal()
      .then(() => {
        showToast({
          message:
            'Withdrawal Requested! You will receive your money in no later than 7 x 24 hours.',
          type: ToastType.success,
        });
      })
      .catch(() => {
        showToast({
          message: 'Failed to request withdrawal',
          type: ToastType.danger,
        });
      });
  };

  const currentActiveTimeline = useMemo(() => {
    const now = new Date().getTime();
    return campaign?.timeline?.find(
      timeline => now >= timeline.start && now <= timeline.end,
    );
  }, [campaign]);

  const [isPaymentModalOpened, setIsPaymentModalOpened] = useState(false);

  const submitReport = () => {
    const reportedId = isCampaignOwner
      ? transaction?.contentCreatorId
      : transaction?.businessPeopleId;
    if (
      !transaction ||
      !selectedReportType ||
      !uid ||
      !reportedId ||
      !transaction.id ||
      !transaction.status
    ) {
      showToast({
        message: 'Something went wrong',
        type: ToastType.danger,
      });
      return;
    }
    setIsLoading(true);
    const report = new Report({
      type: selectedReportType,
      reason: reportDescription.length > 0 ? reportDescription : undefined,
      transactionId: transaction.id,
      transactionStatus: transaction.status,
      reporterId: uid,
      reportedId: reportedId,
    });
    report
      .insert()
      .then(() => {
        setIsReportSheetModalOpen(false);
        showToast({
          message: 'Report submitted!',
          type: ToastType.success,
        });
        // TODO: confirm if we will update the transaction to reported or not
        // transaction
        //   .updateStatus(TransactionStatus.reported)
        //   .then(() => {
        //     setIsReportSheetModalOpen(false);
        //     showToast({
        //       message: 'Report submitted!',
        //       type: ToastType.success,
        //     });
        //   })
        //   .catch(() => {
        //     throw Error('Update transaction status failed');
        //   });
      })
      .catch(err => {
        showToast({
          message: 'Failed to submit report',
          type: ToastType.danger,
        });
        console.log('insert error', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const selectReportType = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    reportViewPagerRef.current?.setPage(1);
  };

  if (transaction === undefined || !campaign) {
    return <LoadingScreen />;
  }

  if (transaction === null) {
    return (
      <PageWithBackButton fullHeight>
        <EmptyPlaceholder
          title="We're experiencing disruptions"
          description="Please try again later"
        />
      </PageWithBackButton>
    );
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton
        fullHeight
        threshold={0}
        withoutScrollView
        backButtonPlaceholder={
          <View
            style={[flex.flex1, flex.flexRow, justify.between, items.center]}>
            <BackButtonLabel text="Transaction Detail" />
            <TouchableOpacity
              style={[
                flex.flexRow,
                gap.small,
                padding.small,
                rounded.default,
                items.center,
                background(COLOR.red[50]),
              ]}
              onPress={() => {
                setIsReportSheetModalOpen(true);
              }}>
              <ReportIcon color={COLOR.black[0]} size="medium" />
              <Text
                className="font-bold"
                style={[font.size[20], textColor(COLOR.black[0])]}>
                Report
              </Text>
            </TouchableOpacity>
          </View>
        }>
        <ScrollView
          bounces={true}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical
          style={[flex.flex1]}
          contentContainerStyle={[
            flex.flexCol,
            {paddingTop: safeAreaInsets.top + size.xlarge3},
            {paddingBottom: Math.max(safeAreaInsets.bottom, size.default)},
            gap.default,
          ]}>
          <View style={[padding.default, flex.flexCol, gap.default]}>
            {transaction.status && (
              <View style={[flex.flexRow, justify.between, items.center]}>
                <Text
                  style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                  Status
                </Text>
                <Pressable
                  style={[flex.flexRow, gap.small]}
                  onPress={() => {
                    if (transaction.campaignId) {
                      navigation.navigate(
                        AuthenticatedNavigation.CampaignTimeline,
                        {
                          campaignId: transaction.campaignId,
                        },
                      );
                    }
                  }}>
                  <StatusTag
                    fontSize={20}
                    status={transaction.status}
                    statusType={transactionStatusTypeMap[transaction.status]}
                  />
                  {transaction.campaignId && (
                    <ChevronRight size="large" color={COLOR.black[30]} />
                  )}
                </Pressable>
              </View>
            )}

            {(transaction.payment !== undefined ||
              transaction.status ===
                TransactionStatus.offerWaitingForPayment) && (
              <>
                <View style={[styles.bottomBorder]} />

                <View style={[flex.flexRow, justify.between, items.center]}>
                  <View style={[flex.flexRow, items.center, gap.default]}>
                    <Text
                      style={[
                        font.size[30],
                        textColor(COLOR.text.neutral.med),
                      ]}>
                      Payment
                    </Text>
                    {/* BP or admin */}
                    {activeRole !== UserRole.ContentCreator && (
                      <>
                        {transaction.payment?.status ===
                        PaymentStatus.proofRejected ? (
                          <CrossIcon
                            width={14}
                            height={14}
                            fill={COLOR.red[50]}
                          />
                        ) : transaction.payment?.status ===
                            PaymentStatus.proofWaitingForVerification ||
                          transaction.payment?.status === undefined ||
                          (transaction.payment?.status ===
                            PaymentStatus.withdrawalRequested &&
                            activeRole === UserRole.Admin) ? (
                          <WarningIcon
                            width={14}
                            height={14}
                            fill={COLOR.yellow[20]}
                          />
                        ) : (
                          <CheckmarkIcon
                            width={14}
                            height={14}
                            fill={COLOR.green[40]}
                          />
                        )}
                      </>
                    )}

                    {/* CC */}
                    {activeRole === UserRole.ContentCreator && (
                      <>
                        {transaction.payment?.status ===
                          PaymentStatus.withdrawn && (
                          <CheckmarkIcon
                            width={14}
                            height={14}
                            fill={COLOR.green[40]}
                          />
                        )}
                        {transaction.payment?.status ===
                          PaymentStatus.withdrawalRequested && (
                          <WarningIcon
                            width={14}
                            height={14}
                            fill={COLOR.yellow[20]}
                          />
                        )}
                      </>
                    )}
                  </View>
                  {activeRole !== UserRole.ContentCreator && (
                    <Pressable onPress={() => setIsPaymentModalOpened(true)}>
                      <Text
                        style={[
                          font.size[30],
                          textColor(COLOR.text.green.default),
                        ]}>
                        {activeRole !== UserRole.Admin ? 'Proof' : 'Manage'}
                      </Text>
                    </Pressable>
                  )}

                  {activeRole === UserRole.ContentCreator && (
                    <>
                      {transaction.isCompleted() ? (
                        <>
                          {transaction.payment?.status ===
                            PaymentStatus.withdrawalRequested ||
                          transaction.payment?.status ===
                            PaymentStatus.withdrawn ? (
                            <StatusTag
                              fontSize={20}
                              status={transaction.payment.status}
                              statusType={
                                paymentStatusTypeMap[transaction.payment.status]
                              }
                            />
                          ) : (
                            <CustomAlert
                              text="Withdraw"
                              type="tertiary"
                              verticalPadding="zero"
                              horizontalPadding="zero"
                              rejectButtonText="Cancel"
                              approveButtonText="OK"
                              disabled={
                                transaction.status !==
                                  TransactionStatus.completed ||
                                transaction.payment?.status !==
                                  PaymentStatus.proofApproved
                              }
                              confirmationText={
                                <Text
                                  className="text-center"
                                  style={[
                                    font.size[30],
                                    textColor(COLOR.text.neutral.med),
                                  ]}>
                                  {user?.bankAccountInformation
                                    ? `You are about to request money withdrawal from Admin, and the money will be sent to the following bank account: ${user?.bankAccountInformation?.bankName} - ${user?.bankAccountInformation?.accountNumber} (${user?.bankAccountInformation?.accountHolderName}). Do you wish to continue?`
                                    : 'You have not set your payment information yet, do you want to set it now?'}
                                </Text>
                              }
                              onApprove={
                                user?.bankAccountInformation
                                  ? onRequestWithdraw
                                  : () =>
                                      navigation.navigate(
                                        AuthenticatedNavigation.EditBankAccountInformation,
                                      )
                              }
                            />
                          )}
                        </>
                      ) : (
                        <Pressable
                          onPress={() =>
                            showToast({
                              message:
                                'You will be able to collect your payment after the transaction is complete.',
                            })
                          }>
                          <InfoIcon
                            width={18}
                            height={18}
                            fill={COLOR.text.neutral.med}
                          />
                        </Pressable>
                      )}
                    </>
                  )}
                </View>
              </>
            )}
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

            {/* <View style={[styles.bottomBorder]} /> */}
          </View>
          <CampaignDetailSection
            transaction={transaction}
            businessPeople={businessPeople}
            campaign={campaign}
          />
          {isCampaignOwner && (
            <ContentCreatorSection contentCreator={contentCreator} />
          )}
          {campaign.isTimelineAvailable(CampaignStep.Brainstorming) && (
            <BrainstormDetailSection transaction={transaction} />
          )}
          <ContentSubmissionDetailSection
            transaction={transaction}
            isCampaignOwner={isCampaignOwner}
          />
          <EngagementResultSubmissionDetailSection
            transaction={transaction}
            isCampaignOwner={isCampaignOwner}
          />
        </ScrollView>
        {isCampaignOwner &&
          transaction.status &&
          transaction.isApprovable() && (
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
              <AnimatedPressable
                style={[
                  flex.flex1,
                  flex.flexRow,
                  items.center,
                  justify.center,
                  dimension.width.xlarge2,
                  rounded.default,
                  border({
                    borderWidth: 1,
                    color: COLOR.black[20],
                  }),
                ]}
                onPress={() => {
                  setIsOthersSheetModalOpen(true);
                }}>
                <MeatballMenuIcon size="xsmall" />
              </AnimatedPressable>
              <View style={[flex.flex1]}>
                <CustomAlert
                  text={`Approve ${
                    transactionStatusCampaignStepMap[transaction.status]
                  }`}
                  rejectButtonText="Cancel"
                  approveButtonText="Approve"
                  confirmationText={
                    <Text
                      className="text-center"
                      style={[
                        font.size[30],
                        textColor(COLOR.text.neutral.med),
                      ]}>
                      Are you sure you want to approve{' '}
                      <Text
                        className="font-bold"
                        style={[textColor(COLOR.text.neutral.high)]}>
                        {contentCreator?.contentCreator?.fullname}
                      </Text>{' '}
                      {`${currentActiveTimeline?.step.toLocaleLowerCase()} ?`}
                    </Text>
                  }
                  onApprove={handleApprove}
                />
              </View>
            </View>
          )}
      </PageWithBackButton>
      <SheetModal
        open={isOthersSheetModalOpen}
        onDismiss={closeOthersSheetModal}
        disablePanDownToClose={true}
        enableHandlePanningGesture={false}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        enableDynamicSizing={true}>
        <BottomSheetModalWithTitle
          title={'Others'}
          type="modal"
          onPress={closeOthersSheetModal}>
          <View style={[flex.flexCol, gap.xsmall2]}>
            <AnimatedPressable
              scale={1}
              style={[padding.vertical.default, padding.horizontal.large]}
              onPress={() => {
                closeOthersSheetModal();
                setIsReportSheetModalOpen(true);
              }}>
              <Text
                style={[
                  font.size[40],
                  textColor(COLOR.text.neutral.high),
                  font.weight.bold,
                ]}>
                Report
              </Text>
            </AnimatedPressable>
            <View style={[styles.bottomBorder]} />
            <AnimatedPressable
              scale={1}
              style={[padding.vertical.default, padding.horizontal.large]}
              onPress={handleReject}>
              <Text
                style={[
                  font.size[40],
                  textColor(COLOR.text.neutral.high),
                  font.weight.bold,
                ]}>
                Reject
              </Text>
            </AnimatedPressable>
          </View>
        </BottomSheetModalWithTitle>
      </SheetModal>
      <SheetModal
        open={isReportSheetModalOpen}
        onDismiss={() => {
          setIsReportSheetModalOpen(false);
        }}
        fullHeight
        enableHandlePanningGesture={false}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        snapPoints={reportIndex === 0 ? [500] : ['90%']}
        enableDynamicSizing={false}>
        <BottomSheetModalWithTitle
          title={'Report'}
          showIcon={reportIndex > 0}
          // type="modal"
          icon={reportIndex > 0 ? 'back' : 'close'}
          fullHeight
          onPress={() => {
            if (reportIndex === 0) {
              setIsReportSheetModalOpen(false);
              return;
            }
            reportViewPagerRef.current?.setPage(0);
          }}>
          <PagerView
            ref={reportViewPagerRef}
            initialPage={0}
            style={[flex.flex1]}
            onPageSelected={e => {
              setReportIndex(e.nativeEvent.position);
            }}>
            <View key={0} style={[flex.grow, flex.flexCol]}>
              {transactionReports.length > 0 && (
                <View
                  style={[
                    flex.flexCol,
                    gap.small,
                    padding.top.default,
                    styles.bottomBorder,
                  ]}>
                  <View
                    style={[
                      flex.flexRow,
                      justify.between,
                      padding.horizontal.default,
                    ]}>
                    <Text
                      style={[
                        font.size[30],
                        font.weight.semibold,
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      Your reports
                    </Text>
                    <InternalLink
                      text="See all"
                      size={30}
                      onPress={navigateToReportList}
                    />
                  </View>
                  <ScrollView
                    style={[
                      {
                        maxHeight: 140,
                      },
                    ]}
                    contentContainerStyle={[
                      flex.flexCol,
                      gap.default,
                      padding.horizontal.default,
                      padding.bottom.default,
                    ]}>
                    {transactionReports
                      .sort((a, b) => (b?.createdAt || 0) - (a?.createdAt || 0))
                      .map(transactionReport => (
                        <View
                          key={transactionReport.id}
                          style={[
                            flex.flexCol,
                            padding.default,
                            rounded.default,
                            gap.small,
                            background(COLOR.red[5]),
                            border({
                              borderWidth: 0.5,
                              color: COLOR.red[60],
                            }),
                          ]}>
                          <View style={[flex.flexCol, gap.xsmall2]}>
                            <Text
                              className="font-semibold"
                              style={[font.size[20], textColor(COLOR.red[60])]}>
                              {transactionReport.type}
                            </Text>
                            {transactionReport.reason && (
                              <Text
                                style={[
                                  font.size[20],
                                  textColor(COLOR.text.danger.default),
                                ]}>
                                {transactionReport.reason}
                              </Text>
                            )}
                          </View>
                          <Text
                            style={[
                              font.size[10],
                              textColor(COLOR.text.danger.default),
                              self.start,
                            ]}>
                            {formatDateToDayMonthYear(
                              new Date(transactionReport.createdAt!!),
                            )}
                          </Text>
                        </View>
                      ))}
                  </ScrollView>
                </View>
              )}
              <View style={[flex.flexCol]}>
                {Object.values(ReportType).map(reportType => (
                  <View key={reportType} style={[flex.flexCol]}>
                    <AnimatedPressable
                      scale={1}
                      style={[
                        flex.flexRow,
                        justify.between,
                        items.center,
                        padding.default,
                      ]}
                      onPress={() => {
                        selectReportType(reportType);
                      }}>
                      <Text
                        className="font-medium"
                        style={[
                          font.size[30],
                          textColor(COLOR.text.neutral.high),
                        ]}>
                        {reportType}
                      </Text>
                      <ChevronRight strokeWidth={1} size="medium" />
                    </AnimatedPressable>
                    <View style={[styles.bottomBorder]} />
                  </View>
                ))}
              </View>
            </View>
            <View
              key={1}
              style={[
                flex.grow,
                flex.flexCol,
                gap.medium,
                padding.top.medium,
                padding.horizontal.default,
              ]}>
              {selectedReportType &&
                selectedReportType !== ReportType.other && (
                  <View style={[flex.flexCol, gap.small]}>
                    <Text
                      className="font-bold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {`${selectedReportType} guidelines`}
                    </Text>
                    <Text
                      className="font-medium"
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {`We define ${selectedReportType.toLocaleLowerCase()} for things like:`}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.med),
                      ]}>
                      {
                        reportTypeLabelMap[selectedReportType][
                          activeRole || UserRole.ContentCreator
                        ]
                      }
                    </Text>
                  </View>
                )}
              <View style={[flex.flex1, flex.flexCol, gap.small]}>
                <FormFieldHelper
                  title="Describe your report"
                  type={
                    selectedReportType === ReportType.other
                      ? 'required'
                      : 'optional'
                  }
                  titleSize={30}
                />
                <BottomSheetScrollView style={[flex.flex1, flex.flexCol]}>
                  <FormlessCustomTextInput
                    type="textarea"
                    rules={
                      selectedReportType === ReportType.other
                        ? {
                            required: 'Report description is required',
                          }
                        : undefined
                    }
                    counter
                    description="Min. 30 character, Max. 1000 character"
                    placeholder="Describe your report here"
                    max={1000}
                    onChange={updateReportDescription}
                  />
                </BottomSheetScrollView>
              </View>
              <CustomButton
                text="Submit"
                disabled={
                  selectedReportType === ReportType.other &&
                  reportDescription.length < 30
                }
                onPress={submitReport}
              />
            </View>
          </PagerView>
        </BottomSheetModalWithTitle>
      </SheetModal>

      {isPaymentModalOpened && (
        <PaymentSheetModal
          isModalOpened={isPaymentModalOpened}
          onModalDismiss={() => setIsPaymentModalOpened(false)}
          transaction={transaction}
        />
      )}
    </>
  );
};

export default TransactionDetailScreen;

interface CampaignDetailSectionProps {
  businessPeople?: User | null;
  transaction?: Transaction;
  campaign: Campaign;
}

export const CampaignDetailSection = ({
  ...props
}: CampaignDetailSectionProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [offer, setOffer] = useState<Offer | null>();
  useEffect(() => {
    if (
      props.transaction?.campaignId &&
      props.transaction?.businessPeopleId &&
      props.transaction?.contentCreatorId
    ) {
      Offer.getLatestOfferByCampaignIdBusinessPeopleIdContentCreatorId(
        props.transaction.campaignId,
        props.transaction?.businessPeopleId,
        props.transaction?.contentCreatorId,
      )
        .then(setOffer)
        .catch(() => setOffer(null));
    } else {
      setOffer(null);
    }
  }, [props.transaction]);
  const latestNegotiation = offer?.getLatestNegotiation();
  const fee =
    props.transaction?.transactionAmount || latestNegotiation?.fee || 0;
  // TODO: fee should use transaction fee rather than campaign fee/price
  // TODO: show transaction important notes for private campaign
  return (
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.default]}>
        <View style={[flex.flexRow, gap.xlarge, justify.between]}>
          <View style={[flex.flexCol]}>
            <Text
              style={[
                font.size[40],
                font.weight.bold,
                textColor(COLOR.text.neutral.high),
              ]}>
              Campaign Detail
            </Text>

            <Text
              style={[font.size[30], textColor(COLOR.text.neutral.med)]}
              numberOfLines={1}>
              {props.campaign.type}
            </Text>
          </View>
          <AnimatedPressable
            scale={0.9}
            style={[
              flex.flex1,
              flex.flexRow,
              justify.end,
              items.center,
              gap.small,
            ]}
            onPress={() => {
              if (props.businessPeople?.id) {
                navigation.navigate(
                  AuthenticatedNavigation.BusinessPeopleDetail,
                  {
                    businessPeopleId: props.businessPeople?.id,
                  },
                );
              }
            }}>
            <View
              style={[
                dimension.square.large,
                overflow.hidden,
                rounded.default,
              ]}>
              <FastImage
                source={getSourceOrDefaultAvatar({
                  uri: props.businessPeople?.businessPeople?.profilePicture,
                })}
                style={[dimension.full]}
              />
            </View>
            <Text
              style={[
                font.size[20],
                font.weight.medium,
                textColor(COLOR.text.neutral.high),
              ]}
              numberOfLines={1}>
              {props.businessPeople?.businessPeople?.fullname}
            </Text>
            <ChevronRight size="large" color={COLOR.text.neutral.med} />
          </AnimatedPressable>
        </View>
        <AnimatedPressable
          style={[
            flex.flexCol,
            padding.default,
            rounded.default,
            border({
              borderWidth: 1,
              color: COLOR.black[20],
            }),
          ]}
          onPress={() => {
            if (props.campaign.id) {
              navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
                campaignId: props.campaign.id,
              });
            }
          }}>
          <View style={[flex.flexRow, gap.small]}>
            <View
              style={[
                dimension.square.xlarge3,
                overflow.hidden,
                rounded.default,
              ]}>
              <FastImage
                source={{uri: props.campaign.image}}
                style={[dimension.full]}
              />
            </View>
            <View style={[flex.flexCol]}>
              <Text
                style={[
                  font.size[30],
                  font.weight.medium,
                  textColor(COLOR.text.neutral.high),
                ]}
                numberOfLines={2}>
                {props.campaign.title}
              </Text>
              <SkeletonPlaceholder isLoading={offer === undefined}>
                <Text
                  style={[
                    font.size[40],
                    font.weight.semibold,
                    textColor(COLOR.text.neutral.high),
                  ]}
                  numberOfLines={1}>
                  {formatToRupiah(fee)}
                </Text>
              </SkeletonPlaceholder>
              <SkeletonPlaceholder isLoading={offer === undefined}>
                {latestNegotiation?.notes && (
                  <View
                    style={[
                      padding.small,
                      background(COLOR.black[5]),
                      rounded.small,
                    ]}>
                    <Text
                      style={[
                        font.size[20],
                        font.weight.medium,
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      Notes:
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {latestNegotiation.notes}
                    </Text>
                  </View>
                )}
              </SkeletonPlaceholder>
            </View>
          </View>
        </AnimatedPressable>
      </View>
    </>
  );
};

interface BrainstormDetailSectionProps {
  transaction: Transaction;
}

const BrainstormDetailSection = ({...props}: BrainstormDetailSectionProps) => {
  const sortedBrainstorms = useMemo(
    () =>
      props.transaction.brainstorms?.sort(
        (a, b) => b.createdAt - a.createdAt,
      ) || [],
    [props.transaction],
  );
  return (
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.medium]}>
        <View style={[flex.flexRow, gap.default, items.center]}>
          <Text
            className="font-semibold"
            style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
            {CampaignStep.Brainstorming}
          </Text>
          {TransactionStatus.brainstormSubmitted ===
            props.transaction.status && (
            <StatusTag status="Review needed" statusType={StatusType.warning} />
          )}
        </View>
        {sortedBrainstorms.length > 0 ? (
          <View style={[flex.flexCol, gap.default, rounded.default]}>
            {sortedBrainstorms
              .slice(0, 1)
              .map((brainstorm, brainstormIndex) => (
                <BrainstormSubmissionCard
                  key={brainstormIndex}
                  transaction={props.transaction}
                  content={brainstorm}
                />
              ))}
          </View>
        ) : (
          <EmptyContent />
        )}
        {sortedBrainstorms.length > 1 && (
          <CollapsiblePanel
            hiddenText={`Show ${sortedBrainstorms.length - 1} more`}>
            {sortedBrainstorms.slice(1).map((brainstorm, brainstormIndex) => (
              <BrainstormSubmissionCard
                key={brainstormIndex}
                transaction={props.transaction}
                content={brainstorm}
              />
            ))}
          </CollapsiblePanel>
        )}
      </View>
    </>
  );
};

interface BrainstormSubmissionCardProps {
  transaction: Transaction;
  content: Brainstorm;
  hideStatus?: boolean;
}

export const BrainstormSubmissionCard = ({
  ...props
}: BrainstormSubmissionCardProps) => {
  return (
    <>
      <View
        style={[
          flex.flexCol,
          padding.default,
          gap.default,
          rounded.medium,
          border({
            borderWidth: 1,
            color: COLOR.black[20],
          }),
        ]}>
        <View style={[flex.flexRow, justify.between, items.center]}>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            {formatDateToDayMonthYearHourMinute(
              new Date(props.content.createdAt),
            )}
          </Text>
          {!props.hideStatus && (
            <StatusTag
              status={props.content.status}
              statusType={basicStatusTypeMap[props.content.status]}
            />
          )}
        </View>
        <View style={[flex.flexCol, gap.medium]}>
          {props?.content?.content &&
            props?.content?.content?.map(
              (transactionContent, platformIndex) => (
                <View
                  key={transactionContent.platform}
                  style={[flex.flexCol, gap.xsmall]}>
                  <View style={[flex.flexRow, gap.xsmall, items.center]}>
                    <PlatformIcon platform={transactionContent.platform} />
                    <Text
                      style={[
                        font.size[20],
                        font.weight.bold,
                        textColor(COLOR.text.neutral.high),
                      ]}>
                      {transactionContent.platform}
                    </Text>
                  </View>
                  <View style={[flex.flexCol, gap.small]}>
                    {transactionContent.tasks.map(
                      (brainstorm, brainstormIndex) => {
                        const transactionTask =
                          props.transaction.platformTasks?.[platformIndex]
                            .tasks[brainstormIndex];
                        return (
                          <View
                            key={brainstormIndex}
                            style={[flex.flexCol, gap.small]}>
                            {transactionTask && (
                              <Text
                                style={[
                                  font.size[20],
                                  font.weight.medium,
                                  textColor(COLOR.text.neutral.med),
                                ]}>
                                {campaignTaskToString(transactionTask)}
                              </Text>
                            )}
                            <View
                              style={[
                                flex.flexCol,
                                gap.default,
                                {
                                  borderWidth: 1,
                                  borderTopColor: COLOR.black[20],
                                  borderRightColor: COLOR.black[20],
                                  borderBottomColor: COLOR.black[20],
                                  borderLeftColor: COLOR.black[30],
                                  borderLeftWidth: size.small,
                                },
                                background(COLOR.black[1]),
                                padding.default,
                                rounded.default,
                              ]}>
                              <Text
                                style={[
                                  font.size[20],
                                  textColor(COLOR.text.neutral.high),
                                ]}>
                                {brainstorm}
                              </Text>
                            </View>
                          </View>
                        );
                      },
                    )}
                  </View>
                </View>
              ),
            )}
          {props.content?.rejection && (
            <View
              style={[
                flex.flexCol,
                gap.small,
                padding.default,
                background(COLOR.red[5]),
                rounded.default,
              ]}>
              <Text
                style={[
                  font.size[20],
                  font.weight.bold,
                  textColor(COLOR.red[60]),
                ]}>
                {props.content.rejection.type}
              </Text>
              <Text style={[font.size[20], textColor(COLOR.red[60])]}>
                {props.content.rejection.reason}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

interface ContentSubmissionDetailSectionProps {
  transaction: Transaction;
  isCampaignOwner: boolean;
}

const ContentSubmissionDetailSection = ({
  ...props
}: ContentSubmissionDetailSectionProps) => {
  const sortedContents = useMemo(
    () =>
      props.transaction.contents?.sort((a, b) => b.createdAt - a.createdAt) ||
      [],
    [props.transaction],
  );
  return (
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.medium]}>
        <View
          style={[flex.flexRow, gap.default, items.center, justify.between]}>
          <View style={[flex.flexCol]}>
            <Text
              style={[
                font.size[30],
                font.weight.semibold,
                textColor(COLOR.text.neutral.high),
              ]}>
              {CampaignStep.ContentCreation}
            </Text>
            <Text
              style={[
                font.size[20],
                textColor(COLOR.text.neutral.med),
              ]}>{`${props.transaction.getRemainingRevisionCount()} revision left`}</Text>
          </View>
          {TransactionStatus.contentSubmitted === props.transaction.status && (
            <StatusTag status="Review needed" statusType={StatusType.warning} />
          )}
          {/* TODO: update status based on transaction status  */}
        </View>
        {sortedContents.length > 0 ? (
          <View style={[flex.flexCol, gap.default, rounded.default]}>
            {sortedContents.slice(0, 1).map((c, cIndex) => (
              <ContentSubmissionCard
                key={cIndex}
                transaction={props.transaction}
                content={c}
              />
            ))}
          </View>
        ) : (
          <EmptyContent />
        )}
        {sortedContents.length > 1 && (
          <CollapsiblePanel
            hiddenText={`Show ${sortedContents.length - 1} more`}>
            {sortedContents.slice(1).map((c, cIndex) => (
              <ContentSubmissionCard
                key={cIndex}
                transaction={props.transaction}
                content={c}
              />
            ))}
          </CollapsiblePanel>
        )}
      </View>
    </>
  );
};

interface ContentSubmissionCardProps {
  transaction: Transaction;
  content: Content;
  hideStatus?: boolean;
}

export const ContentSubmissionCard = ({
  ...props
}: ContentSubmissionCardProps) => {
  const [activeUri, setActiveUri] = useState<string>('');
  return (
    <>
      <ModalWebView
        url={activeUri}
        visible={activeUri !== ''}
        onClose={() => {
          setActiveUri('');
        }}
      />
      <View
        style={[
          flex.flexCol,
          padding.default,
          gap.default,
          rounded.medium,
          border({
            borderWidth: 1,
            color: COLOR.black[20],
          }),
        ]}>
        <View style={[flex.flexRow, justify.between, items.center]}>
          {props.content?.createdAt && (
            <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
              {formatDateToDayMonthYearHourMinute(
                new Date(props.content.createdAt),
              )}
            </Text>
          )}
          {!props.hideStatus && (
            <StatusTag
              status={props.content.status}
              statusType={basicStatusTypeMap[props.content.status]}
            />
          )}
        </View>
        <View style={[flex.flexCol, gap.medium]}>
          {props?.content?.content &&
            props.content.content.map((transactionContent, platformIndex) => (
              <View
                key={transactionContent.platform}
                style={[flex.flexCol, gap.xsmall]}>
                <View style={[flex.flexRow, gap.xsmall, items.center]}>
                  <PlatformIcon platform={transactionContent.platform} />
                  <Text
                    style={[
                      font.size[20],
                      font.weight.bold,
                      textColor(COLOR.text.neutral.high),
                    ]}>
                    {transactionContent.platform}
                  </Text>
                </View>
                <View style={[flex.flexCol, gap.small]}>
                  {transactionContent.tasks.map((task, taskIndex) => {
                    const transactionTask =
                      props.transaction.platformTasks?.[platformIndex].tasks[
                        taskIndex
                      ];
                    return (
                      <View key={taskIndex} style={[flex.flexCol, gap.small]}>
                        {transactionTask && (
                          <Text
                            style={[
                              font.size[20],
                              font.weight.medium,
                              textColor(COLOR.text.neutral.med),
                            ]}>
                            {campaignTaskToString(transactionTask)}
                          </Text>
                        )}
                        {task.uri.map((taskUri, taskUriIndex) => (
                          <View
                            key={taskUriIndex}
                            style={[flex.flexRow, items.center, gap.default]}>
                            <View style={[flex.flex1]}>
                              <Pressable
                                style={[
                                  flex.flex1,
                                  flex.flexRow,
                                  items.center,
                                  padding.small,
                                  rounded.default,
                                  background(COLOR.black[5]),
                                ]}
                                onPress={() => {
                                  setActiveUri(taskUri);
                                }}>
                                <Text
                                  style={[
                                    flex.flex1,
                                    font.weight.bold,
                                    font.size[20],
                                    textColor(COLOR.black[60]),
                                  ]}
                                  numberOfLines={1}>
                                  {taskUri}
                                </Text>
                                <OpenIcon size="medium" />
                              </Pressable>
                            </View>
                            <AnimatedPressable
                              scale={0.9}
                              style={[
                                padding.small,
                                rounded.default,
                                border({
                                  borderWidth: 1,
                                  color: COLOR.black[25],
                                }),
                              ]}
                              onPress={() => {
                                Clipboard.setString(taskUri);
                                showToast({
                                  message: 'Link copied to clipboard',
                                });
                              }}>
                              <CopyIcon size="medium" color={COLOR.black[25]} />
                            </AnimatedPressable>
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          {props.content?.rejection && (
            <View
              style={[
                flex.flexCol,
                gap.small,
                padding.default,
                background(COLOR.red[5]),
                rounded.default,
              ]}>
              <Text
                style={[
                  font.size[20],
                  font.weight.bold,
                  textColor(COLOR.red[60]),
                ]}>
                {props.content.rejection.type}
              </Text>
              <Text style={[font.size[20], textColor(COLOR.red[60])]}>
                {props.content.rejection.reason}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

interface EngagementResultSubmissionDetailSectionProps {
  transaction: Transaction;
  isCampaignOwner: boolean;
}

const EngagementResultSubmissionDetailSection = ({
  ...props
}: EngagementResultSubmissionDetailSectionProps) => {
  const sortedEngagements = useMemo(
    () =>
      props.transaction.engagements?.sort(
        (a, b) => b.createdAt - a.createdAt,
      ) || [],
    [props.transaction],
  );
  return (
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.medium]}>
        <View
          style={[flex.flexRow, gap.default, items.center, justify.between]}>
          <View style={[flex.flexCol]}>
            <Text
              style={[
                font.size[30],
                font.weight.semibold,
                textColor(COLOR.text.neutral.high),
              ]}>
              {CampaignStep.ResultSubmission}
            </Text>
          </View>
          {TransactionStatus.engagementSubmitted ===
            props.transaction.status && (
            <StatusTag status="Review needed" statusType={StatusType.warning} />
          )}
          {/* TODO: update status based on transaction status  */}
        </View>
        {sortedEngagements.length > 0 ? (
          <View style={[flex.flexCol, gap.default, rounded.default]}>
            {sortedEngagements
              .slice(0, 1)
              .map((engagement, engagementIndex) => (
                <EngagementSubmissionCard
                  key={engagementIndex}
                  transaction={props.transaction}
                  engagement={engagement}
                />
              ))}
          </View>
        ) : (
          <EmptyContent />
        )}
        {sortedEngagements.length > 1 && (
          <CollapsiblePanel
            hiddenText={`Show ${sortedEngagements.length - 1} more`}>
            {sortedEngagements.slice(1).map((engagement, engagementIndex) => (
              <EngagementSubmissionCard
                key={engagementIndex}
                transaction={props.transaction}
                engagement={engagement}
              />
            ))}
          </CollapsiblePanel>
        )}
      </View>
    </>
  );
};

interface EngagementSubmissionCardProps {
  transaction: Transaction;
  engagement: Engagement;
  hideStatus?: boolean;
}

export const EngagementSubmissionCard = ({
  ...props
}: EngagementSubmissionCardProps) => {
  const [activePreviewIndex, setActivePreviewIndex] = useState({
    platformIndex: 0,
    taskIndex: 0,
    attachmentIndex: -1,
  });
  const [activeUri, setActiveUri] = useState<string>('');
  return (
    <>
      <ImageView
        images={props.engagement.content[
          activePreviewIndex.platformIndex
        ].tasks[activePreviewIndex.taskIndex].attachments.map(attachment => {
          return {uri: attachment};
        })}
        imageIndex={activePreviewIndex.attachmentIndex}
        visible={activePreviewIndex.attachmentIndex >= 0}
        onRequestClose={() => {
          setActivePreviewIndex(prev => ({
            ...prev,
            attachmentIndex: -1,
          }));
        }}
      />
      <ModalWebView
        url={activeUri}
        visible={activeUri !== ''}
        onClose={() => {
          setActiveUri('');
        }}
      />
      <View
        style={[
          flex.flexCol,
          padding.default,
          gap.default,
          rounded.medium,
          border({
            borderWidth: 1,
            color: COLOR.black[20],
          }),
        ]}>
        <View style={[flex.flexRow, justify.between, items.center]}>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            {formatDateToDayMonthYearHourMinute(
              new Date(props.engagement.createdAt),
            )}
          </Text>
          {!props.hideStatus && (
            <StatusTag
              status={props.engagement.status}
              statusType={basicStatusTypeMap[props.engagement.status]}
            />
          )}
        </View>
        <View style={[flex.flexCol, gap.medium]}>
          {props.engagement.content.map(
            (transactionEngagement, platformIndex) => (
              <View
                key={transactionEngagement.platform}
                style={[flex.flexCol, gap.xsmall]}>
                <View style={[flex.flexRow, gap.xsmall, items.center]}>
                  <PlatformIcon platform={transactionEngagement.platform} />
                  <Text
                    style={[
                      font.size[20],
                      font.weight.bold,
                      textColor(COLOR.text.neutral.high),
                    ]}>
                    {transactionEngagement.platform}
                  </Text>
                </View>
                <View style={[flex.flexCol, gap.default]}>
                  {transactionEngagement.tasks.map((task, taskIndex) => {
                    const transactionTask =
                      props.transaction.platformTasks?.[platformIndex].tasks[
                        taskIndex
                      ];
                    return (
                      <View key={taskIndex} style={[flex.flexCol, gap.small]}>
                        {transactionTask && (
                          <Text
                            style={[
                              font.size[20],
                              font.weight.medium,
                              textColor(COLOR.text.neutral.med),
                            ]}>
                            {campaignTaskToString(transactionTask)}
                          </Text>
                        )}
                        {task.uri.map((taskUri, taskUriIndex) => (
                          <View
                            key={taskUriIndex}
                            style={[flex.flexRow, items.center, gap.default]}>
                            <View style={[flex.flex1]}>
                              <Pressable
                                style={[
                                  flex.flex1,
                                  flex.flexRow,
                                  items.center,
                                  padding.small,
                                  rounded.default,
                                  background(COLOR.black[5]),
                                ]}
                                onPress={() => {
                                  setActiveUri(taskUri);
                                }}>
                                <Text
                                  style={[
                                    flex.flex1,
                                    font.weight.bold,
                                    font.size[20],
                                    textColor(COLOR.black[60]),
                                  ]}
                                  numberOfLines={1}>
                                  {taskUri}
                                </Text>
                                <OpenIcon size="medium" />
                              </Pressable>
                            </View>
                            <AnimatedPressable
                              scale={0.9}
                              style={[
                                padding.small,
                                rounded.default,
                                border({
                                  borderWidth: 1,
                                  color: COLOR.black[25],
                                }),
                              ]}
                              onPress={() => {
                                Clipboard.setString(taskUri);
                                showToast({
                                  message: 'Link copied to clipboard',
                                });
                              }}>
                              <CopyIcon size="medium" color={COLOR.black[25]} />
                            </AnimatedPressable>
                          </View>
                        ))}
                        <ScrollView
                          horizontal
                          contentContainerStyle={[flex.flexRow, gap.small]}>
                          {task.attachments.map(
                            (attachment, attachmentIndex) => (
                              <View
                                key={attachmentIndex}
                                style={[position.relative]}>
                                <Pressable
                                  style={[
                                    overflow.hidden,
                                    dimension.width.xlarge4,
                                    {
                                      aspectRatio: 1 / 1.3,
                                    },
                                    rounded.default,
                                  ]}
                                  onPress={() => {
                                    setActivePreviewIndex({
                                      platformIndex,
                                      taskIndex,
                                      attachmentIndex,
                                    });
                                  }}>
                                  <FastImage
                                    style={[dimension.full]}
                                    source={{
                                      uri: attachment,
                                    }}
                                  />
                                </Pressable>
                              </View>
                            ),
                          )}
                        </ScrollView>
                      </View>
                    );
                  })}
                </View>
              </View>
            ),
          )}
          {props.engagement.rejection && (
            <View
              style={[
                flex.flexCol,
                gap.small,
                padding.default,
                background(COLOR.red[5]),
                rounded.default,
              ]}>
              <Text
                style={[
                  font.size[20],
                  font.weight.bold,
                  textColor(COLOR.red[60]),
                ]}>
                {props.engagement.rejection.type}
              </Text>
              <Text style={[font.size[20], textColor(COLOR.red[60])]}>
                {props.engagement.rejection.reason}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

interface CollapsiblePanelProps {
  visibleText?: string;
  hiddenText?: string;
  children: ReactNode;
}

// TODO: pindah file
export const CollapsiblePanel = ({
  visibleText = 'Show less',
  hiddenText = 'Show more',
  ...props
}: CollapsiblePanelProps) => {
  const [isSeeMore, setIsSeeMore] = useState(false);
  const seeMoreValue = useSharedValue(0);
  const chevronStyle = useAnimatedStyle(() => {
    const rotation = interpolate(seeMoreValue.value, [0, 1], [90, -90]);
    return {
      transform: [
        {
          rotate: `${rotation}deg`,
        },
      ],
    };
  });
  useEffect(() => {
    seeMoreValue.value = withTiming(isSeeMore ? 1 : 0, {
      duration: 300,
    });
  }, [isSeeMore, seeMoreValue]);
  return (
    <View style={[flex.flexCol, gap.large]}>
      <View
        style={[
          overflow.hidden,
          !isSeeMore && {
            maxHeight: 0,
          },
          flex.flexCol,
          gap.medium,
        ]}>
        {props.children}
      </View>
      <AnimatedPressable
        style={[flex.flexRow, items.center, justify.center, gap.small]}
        onPress={() => {
          setIsSeeMore(!isSeeMore);
        }}>
        <Text
          style={[
            font.size[30],
            font.weight.semibold,
            textColor(COLOR.text.green.default),
          ]}>
          {!isSeeMore ? hiddenText : visibleText}
        </Text>
        <Animated.View
          style={[flex.flexRow, justify.center, items.start, chevronStyle]}>
          <ChevronRight size="medium" color={COLOR.text.green.default} />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
};

const EmptyContent = () => {
  return (
    <View style={[flex.flexCol, justify.center, padding.medium]}>
      <Text
        style={[
          self.center,
          text.center,
          font.size[30],
          textColor(COLOR.text.neutral.med),
        ]}>
        No submission yet
      </Text>
    </View>
  );
};

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
