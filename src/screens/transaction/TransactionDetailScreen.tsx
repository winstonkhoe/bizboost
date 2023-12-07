import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../../navigation/StackNavigation';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
} from 'react-native';
import {View} from 'react-native';
import {Campaign, CampaignStep} from '../../model/Campaign';
import {
  formatDateToDayMonthYearHourMinute,
  formatDateToHourMinute,
} from '../../utils/date';
import {CustomButton} from '../../components/atoms/Button';
import {useUser} from '../../hooks/user';
import {
  BasicStatus,
  Content,
  PaymentStatus,
  Transaction,
  TransactionStatus,
  basicStatusTypeMap,
  transactionStatusCampaignStepMap,
  transactionStatusTypeMap,
} from '../../model/Transaction';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';

import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {SocialPlatform, User, UserRole} from '../../model/User';
import {flex, items, justify} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {border} from '../../styles/Border';
import {textColor} from '../../styles/Text';
import {LoadingScreen} from '../LoadingScreen';
import FastImage from 'react-native-fast-image';
import {font} from '../../styles/Font';
import {background} from '../../styles/BackgroundColor';
import {dimension} from '../../styles/Dimension';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import StatusTag, {StatusType} from '../../components/atoms/StatusTag';
import {ScrollView} from 'react-native-gesture-handler';
import {Label} from '../../components/atoms/Label';
import {PlatformData} from '../signup/RegisterSocialPlatform';
import {
  ChevronRight,
  CopyIcon,
  OpenIcon,
  PlatformIcon,
} from '../../components/atoms/Icon';
import WarningIcon from '../../assets/vectors/warning-circle.svg';
import CheckmarkIcon from '../../assets/vectors/checkmark-circle.svg';
import CrossIcon from '../../assets/vectors/cross-circle.svg';

import {formatNumberWithThousandSeparator} from '../../utils/number';
import {CustomModal} from '../../components/atoms/CustomModal';
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
  // TODO: mungkin bisa accept / reject dari sini juga (view payment proof & status jg bisa)
  // TODO: need to add expired validations (if cc still in previous step but the active step is ahead of it, should just show expired and remove all possibility of submission etc)
  const {uid, activeRole} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const navigation = useNavigation<NavigationStackProps>();
  const {transactionId} = route.params;
  const [isOthersSheetModalOpen, setIsOthersSheetModalOpen] =
    useState<boolean>(false);
  const [isRejectSheetModalOpen, setIsRejectSheetModalOpen] =
    useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign>();
  const [transaction, setTransaction] = useState<Transaction | null>();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(false);
  const isCampaignOwner = useMemo(() => {
    return campaign?.userId === uid;
  }, [campaign, uid]);

  useEffect(() => {
    const unsubscribe = Transaction.getById(transactionId, setTransaction);
    return unsubscribe;
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
    if (transaction?.businessPeopleId) {
      User.getById(transaction?.businessPeopleId).then(setBusinessPeople);
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
      if (TransactionStatus.contentSubmitted === transaction.status) {
        setIsConfirmModalOpen(false);
        setIsLoading(true);
        transaction
          .approveContent()
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

  const closeOthersSheetModal = () => {
    setIsOthersSheetModalOpen(false);
  };
  const onRequestWithdraw = () => {
    transaction
      ?.update({
        payment: {
          ...transaction.payment,
          status: PaymentStatus.withdrawalRequested,
        },
      })
      .then(() => {
        showToast({
          message:
            'Withdrawal Requested! You will receive your money in no later than 7 x 24 hours.',
          type: ToastType.success,
        });
      });
  };
  const onProofAccepted = () => {
    transaction
      ?.update({
        payment: {
          ...transaction.payment,
          status: PaymentStatus.proofApproved,
        },
      })
      .then(() => {
        transaction?.approveRegistration();
        showToast({
          message: 'Payment Approved! Registration Status has changed.',
          type: ToastType.success,
        });
      });
  };

  const onProofRejected = () => {
    transaction
      ?.update({
        payment: {
          ...transaction.payment,
          status: PaymentStatus.proofRejected,
        },
      })
      .then(() => {
        showToast({
          message: 'Payment Rejected!',
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

  // TODO: duplicate with RegisteredUserListCard
  const onProofUploaded = (url: string) => {
    if (!transaction) return;
    //TODO: hmm method2 .update() harus disamain deh antar model (campaign sama ini aja beda)
    transaction
      .update({
        payment: {
          proofImage: url,
          status: PaymentStatus.proofWaitingForVerification,
        },
      })
      .then(() => {
        console.log('updated proof!');
        showToast({
          message:
            'Registration Approved! Your payment is being reviewed by our Admin',
          type: ToastType.success,
        });
      });
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
          <Text
            className="font-bold"
            style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
            Transaction Detail
          </Text>
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

            {transaction.payment && activeRole !== UserRole.ContentCreator && (
              <>
                <View style={[styles.bottomBorder]} />

                <Pressable
                  onPress={() => setIsPaymentModalOpened(true)}
                  style={[flex.flexRow, justify.between, items.center]}>
                  <View style={[flex.flexRow, items.center, gap.default]}>
                    <Text
                      style={[
                        font.size[30],
                        textColor(COLOR.text.neutral.med),
                      ]}>
                      Payment
                    </Text>
                    {transaction.payment.status ===
                    PaymentStatus.proofRejected ? (
                      <CrossIcon width={14} height={14} fill={COLOR.red[50]} />
                    ) : transaction.payment.status ===
                        PaymentStatus.proofWaitingForVerification ||
                      // Tujuannya supaya tanda warning kl withdrawal requested tu dari admin aja sih keliatannya
                      (transaction.payment.status ===
                        PaymentStatus.withdrawalRequested &&
                        activeRole === UserRole.Admin) ? (
                      <WarningIcon
                        width={14}
                        height={14}
                        fill={COLOR.yellow[20]}
                      />
                    ) : transaction.payment.status ===
                        PaymentStatus.proofApproved ||
                      activeRole === UserRole.BusinessPeople ? (
                      <CheckmarkIcon
                        width={14}
                        height={14}
                        fill={COLOR.green[40]}
                      />
                    ) : (
                      <></>
                    )}
                  </View>
                  <Text
                    style={[
                      font.size[30],
                      textColor(COLOR.text.green.default),
                    ]}>
                    {activeRole !== UserRole.Admin ? 'View Proof' : 'Manage'}
                  </Text>
                </Pressable>
              </>
            )}
            {/* TODO: jadi satu deh ama yg atas abis ini */}
            {transaction.payment && activeRole === UserRole.ContentCreator && (
              <>
                <View style={[styles.bottomBorder]} />

                <Pressable
                  onPress={() => {
                    // TODO: masukin no rek -> keknya dari profile aja? status paymentnya ganti jangan basic: jadi ada pending admin approval, approved / reject admin, waiting for admin to pay cc (abis cc klik withdraw), withdrawn
                    Alert.alert(
                      'Withdraw',
                      'You are about to request money withdrawal from Admin, and the money will be sent to the bank account that you use on your Profile! Do you wish to continue?',
                      [
                        {
                          text: 'Cancel',
                          onPress: () =>
                            console.log('Cancel Withdrawal Pressed'),
                          style: 'cancel',
                        },
                        {
                          text: 'OK',
                          onPress: onRequestWithdraw,
                          style: 'default',
                        },
                      ],
                    );
                  }}
                  disabled={
                    transaction.status !== TransactionStatus.completed ||
                    transaction.payment.status !== PaymentStatus.proofApproved
                  }
                  style={[flex.flexRow, justify.between, items.center]}>
                  <View style={[flex.flexRow, items.center, gap.default]}>
                    <Text
                      style={[
                        font.size[30],
                        textColor(COLOR.text.neutral.med),
                      ]}>
                      Payment
                    </Text>
                  </View>
                  <Text
                    style={[
                      font.size[30],
                      textColor(
                        transaction.status !== TransactionStatus.completed ||
                          transaction.payment.status !==
                            PaymentStatus.proofApproved
                          ? COLOR.text.neutral.disabled
                          : COLOR.text.green.default,
                      ),
                    ]}>
                    {/* TODO: gatau in ibagusnya nampilim chip juga apa message panjang */}
                    {transaction.payment.status ===
                      PaymentStatus.withdrawalRequested ||
                    transaction.payment.status === PaymentStatus.withdrawn
                      ? transaction.payment.status
                      : 'Withdraw'}
                  </Text>
                </Pressable>
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
          {!isCampaignOwner && (
            <CampaignDetailSection
              businessPeople={businessPeople}
              campaign={campaign}
            />
          )}
          {isCampaignOwner && (
            <ContentCreatorDetailSection contentCreator={contentCreator} />
          )}
          {campaign.isTimelineAvailable(CampaignStep.Brainstorming) && (
            <BrainstormDetailSection transaction={transaction} />
          )}
          <ContentSubmissionDetailSection
            transaction={transaction}
            isCampaignOwner={isCampaignOwner}
          />
        </ScrollView>
        {isCampaignOwner &&
          transaction.status &&
          [
            TransactionStatus.brainstormSubmitted,
            TransactionStatus.contentSubmitted,
          ].find(status => transaction.status === status) && (
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
                  flex.flexRow,
                  gap.xsmall,
                  items.center,
                  justify.center,
                  dimension.square.xlarge2,
                  rounded.default,
                  border({
                    borderWidth: 1,
                    color: COLOR.black[20],
                  }),
                ]}
                onPress={() => {
                  setIsOthersSheetModalOpen(true);
                }}>
                {[...Array(3)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      rounded.max,
                      dimension.square.xsmall,
                      background(COLOR.black[40]),
                    ]}
                  />
                ))}
              </AnimatedPressable>
              <View style={[flex.flex1]}>
                <CustomButton
                  text={`Approve ${
                    transactionStatusCampaignStepMap[transaction.status]
                  }`}
                  onPress={() => {
                    setIsConfirmModalOpen(true);
                  }}
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
              style={[padding.vertical.default]}
              onPress={() => {}}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                Report
              </Text>
            </AnimatedPressable>
            <View style={[styles.bottomBorder]} />
            <AnimatedPressable
              scale={1}
              style={[padding.vertical.default]}
              onPress={() => {
                if (transaction.id) {
                  setIsOthersSheetModalOpen(false);
                  navigation.navigate(
                    AuthenticatedNavigation.RejectTransaction,
                    {
                      transactionId: transaction.id,
                    },
                  );
                }
              }}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                Reject
              </Text>
            </AnimatedPressable>
          </View>
        </BottomSheetModalWithTitle>
      </SheetModal>
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
          fullHeight
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

      <PaymentSheetModal
        isModalOpened={isPaymentModalOpened}
        onModalDismiss={() => setIsPaymentModalOpened(false)}
        amount={campaign?.fee || -1}
        onProofUploaded={onProofUploaded}
        defaultImage={transaction.payment?.proofImage}
        onProofAccepted={onProofAccepted}
        onProofRejected={onProofRejected}
        paymentStatus={transaction.payment?.status}
      />
    </>
  );
};

export default TransactionDetailScreen;

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

interface ContentCreatorDetailSectionProps {
  contentCreator?: User | null;
}

const ContentCreatorDetailSection = ({
  ...props
}: ContentCreatorDetailSectionProps) => {
  return (
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
                  uri: props.contentCreator?.contentCreator?.profilePicture,
                }}
                style={[dimension.full]}
              />
            </View>
            <Text
              className="font-medium"
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}
              numberOfLines={1}>
              {props.contentCreator?.contentCreator?.fullname}
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
                style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
                Specialized categories
              </Text>
              <View style={[flex.flexRow, flex.wrap, gap.xsmall]}>
                {props.contentCreator?.contentCreator?.specializedCategoryIds
                  ?.slice(0, 3)
                  .map(categoryId => (
                    <Label radius="small" key={categoryId} text={categoryId} />
                  ))}
              </View>
            </View>
            <View style={[flex.flexCol, gap.xsmall]}>
              <Text
                className="font-medium"
                style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
                Usual posting schedules
              </Text>
              <View style={[flex.flexRow, flex.wrap, gap.xsmall]}>
                {props.contentCreator?.contentCreator?.postingSchedules
                  ?.slice(0, 3)
                  .map(postingSchedule => (
                    <Label
                      radius="small"
                      key={postingSchedule}
                      text={formatDateToHourMinute(new Date(postingSchedule))}
                    />
                  ))}
              </View>
            </View>
          </View>
          {(props.contentCreator?.instagram ||
            props.contentCreator?.tiktok) && (
            <>
              <View style={[styles.bottomBorder]} />
              <View
                style={[flex.flexRow, flex.wrap, gap.small, justify.around]}>
                {props.contentCreator?.instagram && (
                  <SocialDetail
                    platformData={{
                      platform: SocialPlatform.Instagram,
                      data: props.contentCreator?.instagram,
                    }}
                  />
                )}
                {props.contentCreator?.tiktok && (
                  <SocialDetail
                    platformData={{
                      platform: SocialPlatform.Tiktok,
                      data: props.contentCreator?.tiktok,
                    }}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
};

interface CampaignDetailSectionProps {
  businessPeople?: User | null;
  transaction?: Transaction;
  campaign: Campaign;
}

const CampaignDetailSection = ({...props}: CampaignDetailSectionProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  // TODO: fee should use transaction fee rather than campaign fee/price
  // TODO: show transaction important notes for private campaign
  return (
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.default]}>
        <View style={[flex.flexRow, gap.xlarge, justify.between]}>
          <View style={[flex.flexCol]}>
            <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
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
              className="overflow-hidden"
              style={[dimension.square.large, rounded.default]}>
              <FastImage
                source={getSourceOrDefaultAvatar({
                  uri: props.businessPeople?.businessPeople?.profilePicture,
                })}
                style={[dimension.full]}
              />
            </View>
            <Text
              className="font-medium"
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}
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
              className="overflow-hidden"
              style={[dimension.square.xlarge3, rounded.default]}>
              <FastImage
                source={{uri: props.campaign.image}}
                style={[dimension.full]}
              />
            </View>
            <View style={[flex.flexCol]}>
              <Text
                className="font-medium"
                style={[font.size[30], textColor(COLOR.text.neutral.high)]}
                numberOfLines={2}>
                {props.campaign.title}
              </Text>
              <Text
                className="font-semibold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}
                numberOfLines={1}>
                {formatToRupiah(props.campaign.fee)}
              </Text>
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
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            {formatDateToDayMonthYearHourMinute(
              new Date(props.transaction?.getLatestBrainstorm()!!.createdAt),
            )}
          </Text>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
            {props.transaction?.getLatestBrainstorm()?.content}
          </Text>
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
    <>
      <Seperator />
      <View style={[flex.flexCol, padding.default, gap.medium]}>
        <View
          style={[flex.flexRow, gap.default, items.center, justify.between]}>
          <View style={[flex.flexCol]}>
            <Text
              className="font-semibold"
              style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
              {CampaignStep.ContentSubmission}
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
        <View style={[flex.flexCol, gap.default, rounded.default]}>
          {sortedContents.slice(0, 1).map((c, cIndex) => (
            <ContentSubmissionCard
              key={cIndex}
              transaction={props.transaction}
              content={c}
            />
          ))}
        </View>
        {sortedContents.length > 1 && (
          <View style={[flex.flexCol, gap.large]}>
            <View
              className="overflow-hidden"
              style={[
                !isSeeMore && {
                  maxHeight: 0,
                },
                flex.flexCol,
                gap.medium,
              ]}>
              {sortedContents.slice(1).map((c, cIndex) => (
                <ContentSubmissionCard
                  key={cIndex}
                  transaction={props.transaction}
                  content={c}
                />
              ))}
            </View>
            <AnimatedPressable
              style={[flex.flexRow, items.center, justify.center, gap.small]}
              onPress={() => {
                setIsSeeMore(!isSeeMore);
              }}>
              <Text
                className="font-semibold"
                style={[font.size[30], textColor(COLOR.text.green.default)]}>
                {!isSeeMore
                  ? `Show ${sortedContents.length - 1} more`
                  : 'Show less'}
              </Text>
              <Animated.View
                style={[
                  flex.flexRow,
                  justify.center,
                  items.start,
                  chevronStyle,
                ]}>
                <ChevronRight size="medium" color={COLOR.text.green.default} />
              </Animated.View>
            </AnimatedPressable>
          </View>
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
          {props.content.content.map((transactionContent, platformIndex) => (
            <View
              key={transactionContent.platform}
              style={[flex.flexCol, gap.xsmall]}>
              <View style={[flex.flexRow, gap.xsmall, items.center]}>
                <PlatformIcon platform={transactionContent.platform} />
                <Text
                  className="font-bold"
                  style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
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
                          className="font-medium"
                          style={[
                            font.size[20],
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
                                className="font-bold"
                                style={[
                                  flex.flex1,
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
          {props.content.rejection && (
            <View
              style={[
                flex.flexCol,
                gap.small,
                padding.default,
                background(COLOR.red[5]),
                rounded.default,
              ]}>
              <Text
                className="font-bold"
                style={[font.size[20], textColor(COLOR.red[60])]}>
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
