import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../../../navigation/StackNavigation';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {
  Campaign,
  CampaignStep,
  CampaignTimeline,
  campaignIndexMap,
} from '../../../model/Campaign';

import {useUser} from '../../../hooks/user';

import {PageWithBackButton} from '../../../components/templates/PageWithBackButton';
import {useNavigation} from '@react-navigation/native';
import {flex, items, justify, self} from '../../../styles/Flex';
import {gap} from '../../../styles/Gap';
import {ContentStepper, StepperState} from '../../../components/atoms/Stepper';
import {font} from '../../../styles/Font';
import {HorizontalPadding} from '../../../components/atoms/ViewPadding';
import {padding} from '../../../styles/Padding';
import {rounded} from '../../../styles/BorderRadius';
import {background} from '../../../styles/BackgroundColor';
import {COLOR} from '../../../styles/Color';
import {CustomButton} from '../../../components/atoms/Button';
import {border} from '../../../styles/Border';
import {textColor} from '../../../styles/Text';
import {
  formatDateToDayMonthYear,
  formatDateToDayMonthYearHourMinute,
  formatDateToHourMinute,
  formatTimeDifferenceInDayHourMinute,
} from '../../../utils/date';
import StatusTag, {StatusType} from '../../../components/atoms/StatusTag';
import {
  BasicStatus,
  Transaction,
  TransactionContent,
  TransactionStatus,
  basicStatusTypeMap,
  transactionStatusCampaignStepMap,
  transactionStatusIndexMap,
  transactionStatusStepperStateMap,
  transactionStatusTypeMap,
} from '../../../model/Transaction';
import {LoadingScreen} from '../../LoadingScreen';
import {shadow} from '../../../styles/Shadow';
import {SheetModal} from '../../../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../../../components/templates/BottomSheetModalWithTitle';
import {FormlessCustomTextInput} from '../../../components/atoms/Input';
import {FormFieldHelper} from '../../../components/atoms/FormLabel';
import {ScrollView} from 'react-native-gesture-handler';
import {dimension} from '../../../styles/Dimension';
import {CustomModal} from '../../../components/atoms/CustomModal';
import FastImage from 'react-native-fast-image';
import {SocialPlatform, User} from '../../../model/User';
import {AnimatedPressable} from '../../../components/atoms/AnimatedPressable';
import {clamp, formatNumberWithThousandSeparator} from '../../../utils/number';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {InternalLink} from '../../../components/atoms/Link';
import FieldArray from '../../../components/organisms/FieldArray';
import {FormProvider, useForm} from 'react-hook-form';
import {StringObject, getStringObjectValue} from '../../../utils/stringObject';
import {ChevronRight, PlatformIcon} from '../../../components/atoms/Icon';
import {size} from '../../../styles/Size';
import {campaignTaskToString} from '../../../utils/campaign';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import ImageView from 'react-native-image-viewing';
import {getSourceOrDefaultAvatar} from '../../../utils/asset';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignTimeline
>;

type CampaignTimelineMap = {
  [key in CampaignStep]?: CampaignTimeline;
};

type SubmissionFormData = {
  submission: {
    platform: SocialPlatform;
    tasks: StringObject[][];
  }[];
};

const rules = {
  brainstorm: {
    min: 100,
    max: 1000,
  },
};

const guidelines = {
  engagements: [
    require('../../../assets/images/guidelines/engagement-1.png'),
    require('../../../assets/images/guidelines/engagement-2.png'),
    require('../../../assets/images/guidelines/engagement-3.png'),
  ],
};

interface TransactionView {
  transaction: Transaction;
  contentCreator: User | null;
}

const CampaignTimelineScreen = ({route}: Props) => {
  const {uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const navigation = useNavigation<NavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [activeImageClicked, setActiveImageClicked] = useState(-1);
  const [temporaryBrainstorm, setTemporaryBrainstorm] = useState('');
  const [isBrainstormingModalOpened, setIsBrainstormingModalOpened] =
    useState(false);
  const [isContentSubmissionModalOpen, setIsContentSubmissionModalOpen] =
    useState(false);
  const [isConfirmBrainstormModalOpened, setIsConfirmBrainstormModalOpened] =
    useState(false);
  const [
    isConfirmContentSubmissionModalOpen,
    setIsConfirmContentSubmissionModalOpen,
  ] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentActiveTimeline = useMemo(() => {
    return campaign?.getActiveTimeline();
  }, [campaign]);

  const contentSubmissionMethods = useForm<SubmissionFormData>({
    defaultValues: {
      submission: [],
    },
  });

  const {
    reset: contentSubmissionReset,
    control: contentSubmissionControl,
    getValues: getContentSubmissionValues,
  } = contentSubmissionMethods;

  const resetOriginalField = useCallback(() => {
    contentSubmissionReset({
      submission: transaction?.platformTasks?.map(platformTask => {
        return {
          platform: platformTask.name,
          tasks: [],
        };
      }),
    });
  }, [contentSubmissionReset, transaction]);

  const filteredPendingBrainstormApproval = useMemo(() => {
    return transactions
      .filter(t => t.transaction?.getLatestBrainstorm() !== null)
      .filter(
        t => TransactionStatus.brainstormSubmitted === t.transaction.status,
      )
      .sort(
        (a, b) =>
          a.transaction.getLatestBrainstorm()!!.createdAt -
          b.transaction?.getLatestBrainstorm()!!.createdAt,
      )
      .reverse();
  }, [transactions]);

  const isCampaignOwner = useMemo(() => {
    return uid === campaign?.userId;
  }, [uid, campaign]);

  const currentActiveIndex = useMemo(
    () =>
      currentActiveTimeline
        ? Object.values(CampaignStep)
            .filter(step =>
              campaign?.timeline?.some(timeline => timeline.step === step),
            )
            .indexOf(currentActiveTimeline?.step)
        : Object.values(CampaignStep).filter(step =>
            campaign?.timeline?.some(timeline => timeline.step === step),
          ).length + 1,
    [currentActiveTimeline, campaign],
  );

  const campaignTimelineMap = useMemo(
    () =>
      campaign?.timeline?.reduce((accumulated, currentTimeline) => {
        accumulated[currentTimeline.step] = {
          step: currentTimeline.step,
          start: currentTimeline.start,
          end: currentTimeline.end,
        };
        return accumulated;
      }, {} as CampaignTimelineMap),
    [campaign],
  );

  const stepperStates = useMemo(() => {
    if (campaign && transaction?.status) {
      if (isCampaignOwner) {
        return [
          ...Array(
            (currentActiveTimeline
              ? campaignIndexMap[currentActiveTimeline?.step]
              : campaignIndexMap[CampaignStep.Completed]) + 1,
          ),
        ].map(() => StepperState.success);
      }
      const transactionStatusIndex =
        transactionStatusIndexMap[transaction?.status];
      if (transactionStatusIndex >= 0) {
        const campaignHaveBrainstorming = campaign.isTimelineAvailable(
          CampaignStep.Brainstorming,
        );
        const indexOffset = !campaignHaveBrainstorming
          ? Math.abs(
              campaignIndexMap[CampaignStep.Brainstorming] -
                campaignIndexMap[CampaignStep.ContentSubmission],
            )
          : 0;
        console.log('indexOffset', indexOffset);
        const calculatedTransactionStatusIndex =
          transactionStatusIndex >=
          transactionStatusIndexMap[TransactionStatus.brainstormApproved]
            ? transactionStatusIndex - indexOffset
            : transactionStatusIndex;
        const currentTransactionStep =
          transactionStatusCampaignStepMap[transaction.status];
        const isContentCreatorNotSubmitCurrentActiveTimeline =
          currentActiveTimeline &&
          currentTransactionStep !== currentActiveTimeline.step;
        let steps = [
          ...Array(
            (calculatedTransactionStatusIndex <= 0
              ? 0
              : calculatedTransactionStatusIndex) + 1,
          ),
        ].map(() => StepperState.success);
        console.log(
          'calculatedtransactionstatusindex',
          calculatedTransactionStatusIndex,
        );
        steps[steps.length - 1] =
          transactionStatusStepperStateMap[transaction.status];

        console.log(
          'current transaction step',
          currentTransactionStep,
          'steps',
          steps,
        );
        console.log(
          'current active timeline',
          currentActiveTimeline,
          'currentTransactionStep',
          currentTransactionStep,
        );
        if (isContentCreatorNotSubmitCurrentActiveTimeline) {
          steps[steps.length - 1] = StepperState.inProgress;
        }
        return steps;
      }
      return [StepperState.terminated];
    }
    return [];
  }, [campaign, transaction, currentActiveTimeline, isCampaignOwner]);

  const registerCampaign = () => {
    if (uid && campaign?.userId) {
      const data = new Transaction({
        contentCreatorId: uid || '',
        campaignId: campaignId,
        businessPeopleId: campaign?.userId,
      });

      setIsLoading(true);
      data
        .register()
        .then(() => {
          console.log('Joined!');
        })
        .catch(err => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  const submitBrainstorm = () => {
    if (temporaryBrainstorm.length >= rules.brainstorm.min && transaction) {
      setIsLoading(true);
      transaction
        ?.submitBrainstorm(temporaryBrainstorm)
        .then(isSuccess => {
          if (isSuccess) {
            console.log('submit brainstorm success!');
            setIsBrainstormingModalOpened(false);
            return;
          }
          setIsBrainstormingModalOpened(true);
        })
        .catch(err => {
          console.log(err);
          setIsBrainstormingModalOpened(true);
        })
        .finally(() => {
          setIsLoading(false);
          setIsConfirmBrainstormModalOpened(false);
        });
    }
  };

  const submitContentSubmission = () => {
    const data = getContentSubmissionValues();
    const transactionContent: TransactionContent[] = data.submission.map(
      submission => {
        return {
          platform: submission.platform,
          tasks: submission.tasks.map(task => {
            return {
              uri: task.map(getStringObjectValue),
            };
          }),
        };
      },
    );
    setIsConfirmContentSubmissionModalOpen(false);
    setIsLoading(true);
    transaction
      ?.submitContent(transactionContent)
      .then(isSuccess => {
        if (isSuccess) {
          console.log('submit content success!');
          setIsContentSubmissionModalOpen(false);
          if (transaction) {
            resetOriginalField();
          }
          return;
        }
        console.log('submit content failed!');
      })
      .catch(err => console.log('submitContentSubmission err', err))
      .finally(() => {
        setIsLoading(false);
      });
    console.log(data);
  };

  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

  useEffect(() => {
    if (transaction) {
      resetOriginalField();
    }
  }, [transaction, resetOriginalField]);

  useEffect(() => {
    const unsubscribe = Transaction.getTransactionByContentCreator(
      campaignId,
      uid || '',
      setTransaction,
    );

    return unsubscribe;
  }, [campaignId, uid]);

  useEffect(() => {
    if (isCampaignOwner) {
      const unsubscribe = Transaction.getAllTransactionsByCampaign(
        campaignId,
        t => {
          User.getByIds(
            t
              .map(transaction => transaction.contentCreatorId)
              .filter((id): id is string => id !== undefined),
          ).then(users => {
            setTransactions(
              t.map(transaction => {
                return {
                  transaction: transaction,
                  contentCreator:
                    users.find(
                      user => user.id === transaction.contentCreatorId,
                    ) || null,
                };
              }),
            );
          });
        },
      );

      return unsubscribe;
    }
  }, [isCampaignOwner, campaignId, uid]);

  const navigateToDetail = (status: TransactionStatus) => {
    navigation.navigate(AuthenticatedNavigation.CampaignRegistrants, {
      campaignId: campaignId,
      initialTransactionStatusFilter: status,
    });
  };

  const navigateToTransactionDetail = (transactionId: string) => {
    navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
      transactionId: transactionId,
    });
  };

  if (!campaign || !transaction) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <ImageView
        images={guidelines.engagements}
        imageIndex={activeImageClicked}
        visible={activeImageClicked >= 0}
        onRequestClose={() => setActiveImageClicked(-1)}
        swipeToCloseEnabled
        backgroundColor="white"
      />
      <PageWithBackButton enableSafeAreaContainer fullHeight>
        <HorizontalPadding>
          <View style={[flex.flexCol, gap.default, padding.top.xlarge3]}>
            <ContentStepper
              currentPosition={currentActiveIndex}
              stepperStates={stepperStates}
              decreasePreviousVisibility={!isCampaignOwner}
              // currentPosition={2}
              maxPosition={0}>
              {campaignTimelineMap?.[CampaignStep.Registration] && (
                <View
                  style={[
                    flex.flexCol,
                    shadow.medium,
                    rounded.medium,
                    background(COLOR.black[0]),
                  ]}>
                  <View
                    style={[
                      flex.flexRow,
                      gap.medium,
                      items.center,
                      (isCampaignOwner ||
                        transaction?.status ===
                          TransactionStatus.notRegistered) &&
                        styles.headerBorder,
                    ]}>
                    <StepperLabel
                      timeline={campaignTimelineMap[CampaignStep.Registration]}>
                      {transaction?.status &&
                      transactionStatusCampaignStepMap[transaction?.status] ===
                        CampaignStep.Registration ? (
                        isCampaignOwner ? (
                          <StatusTag
                            status={`${formatNumberWithThousandSeparator(
                              transactions.filter(
                                t =>
                                  t.transaction.status ===
                                  TransactionStatus.registrationApproved,
                              ).length,
                            )} Registrant Approved`}
                            statusType={StatusType.success}
                          />
                        ) : (
                          transaction.status !==
                            TransactionStatus.notRegistered && (
                            <StatusTag
                              status={
                                transaction?.status ===
                                TransactionStatus.registrationApproved
                                  ? BasicStatus.approved
                                  : transaction?.status ===
                                    TransactionStatus.registrationRejected
                                  ? BasicStatus.rejected
                                  : BasicStatus.pending
                              }
                              statusType={
                                transactionStatusTypeMap[transaction?.status]
                              }
                            />
                          )
                        )
                      ) : null}
                    </StepperLabel>
                  </View>
                  {isCampaignOwner ? (
                    <AnimatedPressable
                      scale={1}
                      onPress={() => {
                        navigateToDetail(TransactionStatus.registrationPending);
                      }}
                      style={[flex.flexRow, padding.default, gap.small]}>
                      <View style={[flex.flex1, flex.flexCol, gap.small]}>
                        <Text
                          className="font-medium"
                          style={[
                            font.size[20],
                            textColor(COLOR.text.neutral.high),
                          ]}>
                          Pending Registrants
                        </Text>
                        <View style={[flex.flexRow]}>
                          {transactions
                            .filter(
                              t =>
                                t.transaction.status ===
                                TransactionStatus.registrationPending,
                            )
                            .map((t, i) => {
                              return (
                                <View
                                  key={i}
                                  style={[
                                    dimension.square.xlarge2,
                                    rounded.max,
                                    padding.xsmall,
                                    background(COLOR.black[0]),
                                    {
                                      marginLeft: i > 0 ? -10 : 0,
                                      zIndex: 5 - i,
                                    },
                                  ]}>
                                  <View
                                    className="overflow-hidden"
                                    style={[dimension.full, rounded.max]}>
                                    <FastImage
                                      style={[dimension.full]}
                                      source={getSourceOrDefaultAvatar({
                                        uri: t.contentCreator?.contentCreator
                                          ?.profilePicture,
                                      })}
                                    />
                                  </View>
                                </View>
                              );
                            })}
                        </View>
                      </View>
                      <View style={[flex.flexRow, items.center]}>
                        <ChevronRight color={COLOR.black[20]} />
                      </View>
                    </AnimatedPressable>
                  ) : (
                    transaction?.status === TransactionStatus.notRegistered && (
                      <View style={[padding.default]}>
                        <CustomButton
                          text="Register now"
                          onPress={registerCampaign}
                        />
                      </View>
                    )
                  )}
                </View>
              )}
              {campaignTimelineMap?.[CampaignStep.Brainstorming] && (
                <View
                  style={[
                    flex.flexCol,
                    shadow.medium,
                    rounded.medium,
                    background(COLOR.black[0]),
                  ]}>
                  <View style={[flex.flexCol, styles.headerBorder]}>
                    <StepperLabel
                      timeline={campaignTimelineMap[CampaignStep.Brainstorming]}
                    />
                  </View>
                  <View style={[flex.flexCol, padding.default, gap.medium]}>
                    <View style={[flex.flexCol, gap.default]}>
                      <Text
                        className="font-medium"
                        style={[
                          font.size[30],
                          textColor(COLOR.text.neutral.med),
                        ]}>
                        💡 Things to highlight
                      </Text>
                      <View style={[flex.flexCol, gap.xsmall]}>
                        <Text style={[font.size[30]]}>
                          {campaign?.description}
                        </Text>
                        {campaign.importantInformation &&
                          campaign.importantInformation?.length > 0 &&
                          campaign.importantInformation.map((info, index) => {
                            return (
                              <Text key={index} style={[font.size[30]]}>
                                {info}
                              </Text>
                            );
                          })}
                      </View>
                    </View>
                    {isCampaignOwner ? (
                      <>
                        <View
                          style={[dimension.width.full, styles.headerBorder]}
                        />
                        <View style={[flex.flexCol, gap.default]}>
                          <View style={[flex.flexRow, justify.between]}>
                            <Text
                              className="font-medium"
                              style={[
                                font.size[30],
                                textColor(COLOR.text.neutral.med),
                              ]}>
                              {filteredPendingBrainstormApproval.length > 0
                                ? 'Pending Approval'
                                : 'No Pending Approval'}
                            </Text>
                            {filteredPendingBrainstormApproval.length > 0 && (
                              <InternalLink
                                size={30}
                                text="See all"
                                onPress={() => {
                                  navigateToDetail(
                                    TransactionStatus.brainstormSubmitted,
                                  );
                                }}
                              />
                            )}
                          </View>
                          {filteredPendingBrainstormApproval.length > 0 && (
                            <ScrollView
                              horizontal
                              contentContainerStyle={[
                                flex.flexRow,
                                gap.default,
                              ]}>
                              {filteredPendingBrainstormApproval.map(t => {
                                const brainstorm =
                                  t.transaction.getLatestBrainstorm();
                                if (!brainstorm) {
                                  return null;
                                }
                                return (
                                  <AnimatedPressable
                                    onPress={() => {
                                      if (t.transaction.id) {
                                        navigateToTransactionDetail(
                                          t.transaction.id,
                                        );
                                      }
                                    }}
                                    scale={0.95}
                                    key={t.transaction.id}
                                    style={[
                                      flex.flex1,
                                      flex.flexCol,
                                      justify.around,
                                      gap.default,
                                      styles.pendingCardBorder,
                                      padding.default,
                                      rounded.default,
                                      dimension.width.xlarge14,
                                    ]}>
                                    <View style={[flex.flexCol]}>
                                      <Text
                                        style={[
                                          font.size[20],
                                          textColor(COLOR.text.neutral.med),
                                        ]}>
                                        {
                                          t.contentCreator?.contentCreator
                                            ?.fullname
                                        }
                                      </Text>
                                      <Text
                                        style={[
                                          font.size[10],
                                          textColor(COLOR.text.neutral.med),
                                        ]}>
                                        {formatDateToDayMonthYearHourMinute(
                                          new Date(brainstorm.createdAt),
                                        )}
                                      </Text>
                                    </View>
                                    <Text
                                      style={[
                                        font.size[20],
                                        textColor(COLOR.text.neutral.high),
                                      ]}
                                      numberOfLines={3}>
                                      {brainstorm.content}
                                    </Text>
                                  </AnimatedPressable>
                                );
                              })}
                            </ScrollView>
                          )}
                        </View>
                      </>
                    ) : (
                      transaction?.brainstorms &&
                      transaction?.brainstorms.length > 0 && (
                        <>
                          <View
                            style={[dimension.width.full, styles.headerBorder]}
                          />
                          <View style={[flex.flexCol, gap.small]}>
                            <Text
                              className="font-medium"
                              style={[
                                font.size[30],
                                textColor(COLOR.text.neutral.med),
                              ]}>
                              Your previous submission
                            </Text>
                            <ScrollView
                              horizontal
                              contentContainerStyle={[
                                flex.flexRow,
                                gap.default,
                              ]}>
                              {transaction.brainstorms
                                .sort((a, b) => a.createdAt - b.createdAt)
                                .reverse()
                                .map(brainstorm => {
                                  return (
                                    <View
                                      key={brainstorm.createdAt}
                                      style={[
                                        flex.flex1,
                                        flex.flexCol,
                                        gap.default,
                                        BasicStatus.rejected ===
                                          brainstorm.status &&
                                          styles.rejectedCardBorder,
                                        BasicStatus.pending ===
                                          brainstorm.status &&
                                          styles.pendingCardBorder,
                                        BasicStatus.approved ===
                                          brainstorm.status &&
                                          styles.approvedCardBorder,
                                        padding.default,
                                        rounded.default,
                                        dimension.width.xlarge14,
                                      ]}>
                                      <View
                                        style={[
                                          flex.flexRow,
                                          gap.medium,
                                          justify.between,
                                        ]}>
                                        <Text
                                          style={[
                                            font.size[20],
                                            textColor(COLOR.text.neutral.med),
                                          ]}>
                                          {formatDateToDayMonthYearHourMinute(
                                            new Date(brainstorm.createdAt),
                                          )}
                                        </Text>
                                        <StatusTag
                                          status={brainstorm.status}
                                          statusType={
                                            basicStatusTypeMap[
                                              brainstorm.status
                                            ]
                                          }
                                        />
                                      </View>
                                      <Text
                                        style={[
                                          font.size[20],
                                          textColor(COLOR.text.neutral.high),
                                        ]}
                                        numberOfLines={3}>
                                        {brainstorm.content}
                                      </Text>
                                      {brainstorm.rejectReason && (
                                        <View
                                          style={[
                                            padding.small,
                                            rounded.small,
                                            background(COLOR.red[10], 0.3),
                                            dimension.width.full,
                                          ]}>
                                          <Text
                                            className="font-medium"
                                            style={[
                                              font.size[20],
                                              textColor(
                                                COLOR.text.danger.default,
                                              ),
                                            ]}
                                            numberOfLines={3}>
                                            {brainstorm.rejectReason}
                                          </Text>
                                        </View>
                                      )}
                                    </View>
                                  );
                                })}
                            </ScrollView>
                          </View>
                        </>
                      )
                    )}
                    {!isCampaignOwner &&
                      (!transaction?.getLatestBrainstorm() ||
                        transaction?.getLatestBrainstorm()?.status ===
                          BasicStatus.rejected) && (
                        <CustomButton
                          text="Submit idea"
                          onPress={() => {
                            setIsBrainstormingModalOpened(true);
                          }}
                        />
                      )}
                  </View>
                </View>
              )}
              {campaignTimelineMap?.[CampaignStep.ContentSubmission] && (
                <View
                  style={[
                    flex.flexCol,
                    shadow.medium,
                    rounded.medium,
                    background(COLOR.black[0]),
                  ]}>
                  <View style={[flex.flexCol, styles.headerBorder]}>
                    <StepperLabel
                      timeline={
                        campaignTimelineMap[CampaignStep.ContentSubmission]
                      }
                    />
                  </View>
                  {!isCampaignOwner && (
                    <View
                      style={[
                        flex.flexCol,
                        gap.default,
                        padding.vertical.default,
                      ]}>
                      <View style={[flex.flexCol, gap.xsmall]}>
                        <View
                          style={[
                            flex.flexRow,
                            justify.between,
                            padding.horizontal.default,
                          ]}>
                          <Text
                            className="font-semibold"
                            style={[
                              font.size[30],
                              textColor(COLOR.text.neutral.high),
                            ]}>
                            Your task
                          </Text>
                          {transaction?.status &&
                            transactionStatusCampaignStepMap[
                              transaction?.status
                            ] === CampaignStep.ContentSubmission &&
                            transaction.contents &&
                            transaction.contents.length > 0 && (
                              <InternalLink
                                text="View Submission"
                                size={30}
                                onPress={() => {
                                  if (transaction.id) {
                                    navigateToTransactionDetail(transaction.id);
                                  }
                                }}
                              />
                            )}
                        </View>
                        <View style={[flex.flexCol, gap.medium]}>
                          {transaction?.platformTasks?.map(platform => (
                            <View
                              key={platform.name}
                              style={[flex.flexCol, gap.small]}>
                              <View
                                style={[
                                  flex.flexRow,
                                  padding.horizontal.default,
                                  gap.xsmall,
                                  items.center,
                                ]}>
                                <PlatformIcon platform={platform.name} />
                                <Text
                                  className="font-semibold"
                                  style={[
                                    font.size[20],
                                    textColor(COLOR.text.neutral.high),
                                  ]}>
                                  {platform.name}
                                </Text>
                              </View>
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={[
                                  flex.flexRow,
                                  gap.small,
                                  padding.horizontal.default,
                                ]}>
                                {platform.tasks.map((task, taskIndex) => (
                                  <View
                                    key={taskIndex}
                                    style={[
                                      flex.flexCol,
                                      padding.small,
                                      rounded.default,
                                      border({
                                        borderWidth: 0.7,
                                        color: COLOR.black[30],
                                      }),
                                      {
                                        maxWidth: size.xlarge11,
                                      },
                                    ]}>
                                    <Text
                                      style={[
                                        font.size[20],
                                        textColor(COLOR.text.neutral.high),
                                      ]}>
                                      {campaignTaskToString(task)}
                                    </Text>
                                    {task.description && (
                                      <Text
                                        style={[
                                          font.size[20],
                                          textColor(COLOR.text.neutral.med),
                                        ]}>
                                        {task.description}
                                      </Text>
                                    )}
                                  </View>
                                ))}
                              </ScrollView>
                            </View>
                          ))}
                        </View>
                      </View>
                      {transaction?.status !==
                        TransactionStatus.contentSubmitted &&
                        transaction?.status !==
                          TransactionStatus.contentApproved && (
                          <View style={[padding.horizontal.default]}>
                            <CustomButton
                              text="Upload"
                              onPress={() => {
                                setIsContentSubmissionModalOpen(true);
                              }}
                            />
                          </View>
                        )}
                    </View>
                  )}
                  {isCampaignOwner && (
                    <AnimatedPressable
                      scale={1}
                      onPress={() => {
                        navigateToDetail(TransactionStatus.contentSubmitted);
                      }}
                      style={[flex.flexRow, padding.default, gap.small]}>
                      <View style={[flex.flex1, flex.flexCol]}>
                        <Text
                          className="font-medium"
                          style={[
                            font.size[20],
                            textColor(COLOR.text.neutral.high),
                          ]}>
                          {`${
                            transactions.filter(t => {
                              const latestSubmission =
                                t.transaction.getLatestContentSubmission();
                              return (
                                latestSubmission &&
                                latestSubmission.status === BasicStatus.pending
                              );
                            }).length
                          } review needed`}
                        </Text>
                        <Text
                          style={[
                            font.size[20],
                            textColor(COLOR.text.neutral.med),
                          ]}>{`${
                          transactions.filter(t => {
                            const latestSubmission =
                              t.transaction.getLatestContentSubmission();
                            return (
                              latestSubmission &&
                              latestSubmission.status === BasicStatus.approved
                            );
                          }).length
                        } completed`}</Text>
                      </View>
                      <View style={[flex.flexRow, items.center]}>
                        <ChevronRight color={COLOR.black[20]} />
                      </View>
                    </AnimatedPressable>
                  )}
                </View>
              )}
              {campaignTimelineMap?.[
                CampaignStep.EngagementResultSubmission
              ] && (
                <View style={[flex.flexCol, shadow.medium, rounded.medium]}>
                  <View style={[flex.flexCol, styles.headerBorder]}>
                    <StepperLabel
                      timeline={
                        campaignTimelineMap[
                          CampaignStep.EngagementResultSubmission
                        ]
                      }
                    />
                  </View>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      rounded.default,
                      gap.default,
                    ]}>
                    <View style={[flex.flexRow, justify.between]}>
                      <Text
                        className="font-semibold"
                        style={[
                          font.size[30],
                          textColor(COLOR.text.neutral.high),
                        ]}
                        numberOfLines={1}>
                        Guideline
                      </Text>
                      {transaction?.status &&
                        transactionStatusCampaignStepMap[
                          transaction?.status
                        ] === CampaignStep.EngagementResultSubmission &&
                        transaction.engagements &&
                        transaction.engagements.length > 0 && (
                          <InternalLink
                            text="View Submission"
                            size={30}
                            onPress={() => {
                              if (transaction.id) {
                                navigateToTransactionDetail(transaction.id);
                              }
                            }}
                          />
                        )}
                    </View>
                    <ScrollView
                      contentContainerStyle={[flex.flexRow, gap.default]}
                      horizontal>
                      {guidelines.engagements.map((engagement, index) => (
                        <Pressable
                          key={index}
                          className="overflow-hidden"
                          style={[
                            dimension.width.xlarge3,
                            rounded.default,
                            {
                              aspectRatio: 1 / 1.3,
                            },
                            border({
                              borderWidth: 1,
                              color: COLOR.black[20],
                            }),
                          ]}
                          onPress={() => {
                            setActiveImageClicked(index);
                          }}>
                          <FastImage
                            style={[dimension.full]}
                            source={engagement}
                          />
                        </Pressable>
                      ))}
                    </ScrollView>
                    <View
                      style={[
                        flex.flexCol,
                        gap.default,
                        padding.default,
                        rounded.default,
                        background(`${COLOR.green[5]}`),
                      ]}>
                      <Text>ℹ️ Don't forget</Text>
                      <Text>
                        {`· Screenshot uploaded content\n· Upload engagement result`}
                      </Text>
                    </View>
                    <CustomButton
                      text="Upload"
                      onPress={() => {
                        if (transaction.id) {
                          navigation.navigate(
                            AuthenticatedNavigation.SubmitEngagementResult,
                            {
                              transactionId: transaction?.id,
                            },
                          );
                        }
                      }}
                    />
                  </View>
                </View>
              )}
            </ContentStepper>
          </View>
        </HorizontalPadding>
      </PageWithBackButton>
      <CustomModal transparent={true} visible={isConfirmBrainstormModalOpened}>
        <View style={[flex.flexCol, padding.default, gap.large]}>
          <View style={[flex.flexRow, justify.center, padding.medium]}>
            <Text className="text-center font-medium" style={[font.size[30]]}>
              Please review your submission carefully. Once you submit your
              idea,{' '}
              <Text className="font-bold">
                you will not be able to edit it.
              </Text>
            </Text>
          </View>
          <View style={[flex.flexRow, gap.large, justify.center]}>
            <CustomButton
              text="Edit"
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
              onPress={() => {
                setIsConfirmBrainstormModalOpened(false);
              }}
            />
            <CustomButton text="Submit" onPress={submitBrainstorm} />
          </View>
        </View>
      </CustomModal>
      <CustomModal
        transparent={true}
        visible={isConfirmContentSubmissionModalOpen}>
        <View style={[flex.flexCol, padding.default, gap.large]}>
          <View style={[flex.flexRow, justify.center, padding.medium]}>
            <Text className="text-center font-medium" style={[font.size[30]]}>
              Please review your submission carefully. Once you submit your
              task's content,{' '}
              <Text className="font-bold">
                you will not be able to edit it.
              </Text>
            </Text>
          </View>
          <View style={[flex.flexRow, gap.large, justify.center]}>
            <CustomButton
              text="Adjust again"
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
              onPress={() => {
                setIsConfirmContentSubmissionModalOpen(false);
              }}
            />
            <CustomButton text="Submit" onPress={submitContentSubmission} />
          </View>
        </View>
      </CustomModal>
      <SheetModal
        open={isBrainstormingModalOpened}
        onDismiss={() => {
          setIsBrainstormingModalOpened(false);
        }}
        snapPoints={[windowDimension.height - safeAreaInsets.top]}
        disablePanDownToClose
        fullHeight
        enableHandlePanningGesture={false}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        enableDynamicSizing={false}>
        <BottomSheetModalWithTitle
          title="Brainstorming"
          fullHeight
          type="modal"
          onPress={() => {
            setIsBrainstormingModalOpened(false);
          }}>
          <View style={[flex.grow, flex.flexCol, gap.medium]}>
            <View style={[flex.flex1, flex.flexCol, gap.default]}>
              <FormFieldHelper
                title="Idea draft"
                description="Showcase your creativity in this idea to stand out and be chosen by the business owner."
              />
              <BottomSheetScrollView style={[flex.flex1]} bounces={false}>
                <FormlessCustomTextInput
                  type="textarea"
                  description={`Submit your idea in ${rules.brainstorm.min} - ${rules.brainstorm.max} characters.\nBe concise yet comprehensive.`}
                  max={rules.brainstorm.max}
                  counter
                  onChange={setTemporaryBrainstorm}
                />
              </BottomSheetScrollView>
            </View>
            <CustomButton
              text="Submit"
              disabled={temporaryBrainstorm.length < rules.brainstorm.min}
              onPress={() => {
                setIsConfirmBrainstormModalOpened(true);
              }}
            />
          </View>
        </BottomSheetModalWithTitle>
      </SheetModal>
      <SheetModal
        open={isContentSubmissionModalOpen}
        onDismiss={() => {
          setIsContentSubmissionModalOpen(false);
        }}
        snapPoints={[windowDimension.height - safeAreaInsets.top]}
        disablePanDownToClose
        fullHeight
        enableHandlePanningGesture={false}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        enableDynamicSizing={false}>
        <BottomSheetModalWithTitle
          title={CampaignStep.ContentSubmission}
          fullHeight
          type="modal"
          onPress={() => {
            setIsContentSubmissionModalOpen(false);
          }}>
          <FormProvider {...contentSubmissionMethods}>
            <View style={[flex.grow, flex.flexCol, gap.medium]}>
              <BottomSheetScrollView style={[flex.flex1]} bounces={false}>
                <View style={[flex.flex1, flex.flexCol, gap.xlarge2]}>
                  {transaction?.platformTasks?.map(
                    (platform, platformIndex) => (
                      <View
                        key={platform.name}
                        style={[flex.flexCol, gap.medium]}>
                        {platform.tasks.map((task, taskIndex) => (
                          <View
                            key={taskIndex}
                            style={[flex.flexRow, gap.medium, items.center]}>
                            <FieldArray
                              title={`${platform.name} · ${campaignTaskToString(
                                task,
                              )}`}
                              description={task.description}
                              placeholder="Add url"
                              maxFieldLength={0}
                              helperText={`Make sure url is publicly accessible.\nEx. https://drive.google.com/file/d/1Go0RYsRgia9ZoMy10O8XBrfnIWMCopHs/view?usp=sharing`}
                              control={contentSubmissionControl}
                              fieldType="textarea"
                              type="required"
                              rules={{
                                required: 'URL is required',
                                pattern: {
                                  value: /^(http|https):\/\/[^ "]+$/,
                                  message: 'Invalid URL',
                                },
                              }}
                              parentName={`submission.${platformIndex}.tasks.${taskIndex}`}
                              childName="value"
                            />
                          </View>
                        ))}
                      </View>
                    ),
                  )}
                </View>
              </BottomSheetScrollView>
              <CustomButton
                text="Submit"
                disabled={
                  transaction?.platformTasks &&
                  transaction.platformTasks.filter(
                    (platform, platformIndex) =>
                      platform.tasks?.filter(
                        (task, taskIndex) =>
                          getContentSubmissionValues(
                            `submission.${platformIndex}.tasks.${taskIndex}`,
                          )?.length < task.quantity,
                      ).length > 0,
                  ).length > 0
                }
                onPress={() => {
                  setIsConfirmContentSubmissionModalOpen(true);
                }}
              />
            </View>
          </FormProvider>
        </BottomSheetModalWithTitle>
      </SheetModal>
    </>
  );
};

interface StepperLabelProps {
  timeline: CampaignTimeline;
  children?: ReactNode;
}

const StepperLabel = ({timeline, children}: StepperLabelProps) => {
  return (
    <View style={[flex.flex1, flex.flexCol, gap.medium, padding.default]}>
      <View style={[flex.flexRow, justify.between]}>
        <Text
          className="font-semibold"
          style={[font.size[40], textColor(COLOR.text.neutral.high)]}
          numberOfLines={1}>
          {timeline.step}
        </Text>
        {children}
      </View>
      <View style={[flex.flexRow, gap.medium, justify.between]}>
        <View style={[flex.flexCol]}>
          <Text
            style={[font.size[20], textColor(COLOR.text.neutral.high)]}
            numberOfLines={1}>
            {formatDateToDayMonthYear(new Date(timeline.start))}
          </Text>
          <Text
            className="font-semibold"
            style={[font.size[30], textColor(COLOR.text.neutral.high)]}
            numberOfLines={1}>
            {formatDateToHourMinute(new Date(timeline.start))}
          </Text>
        </View>
        <View style={[flex.flex1, flex.flexCol, gap.xsmall2]}>
          <TimelineRemaining timeline={timeline} />
        </View>
        <View style={[flex.flexCol, items.end]}>
          <Text
            style={[font.size[20], textColor(COLOR.text.neutral.high)]}
            numberOfLines={1}>
            {formatDateToDayMonthYear(new Date(timeline.end))}
          </Text>
          <Text
            className="font-semibold"
            style={[font.size[30], textColor(COLOR.text.neutral.high)]}
            numberOfLines={1}>
            {formatDateToHourMinute(new Date(timeline.end))}
          </Text>
        </View>
      </View>
    </View>
  );
};

interface TimelineRemainingProps {
  timeline: CampaignTimeline;
}

const TimelineRemaining = ({timeline}: TimelineRemainingProps) => {
  const timelineStart = useMemo(
    () => new Date(timeline.start),
    [timeline.start],
  );
  const timelineEnd = useMemo(() => new Date(timeline.end), [timeline.end]);
  const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
  const width = useSharedValue(1);
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const start = new Date(
        clamp(now.getTime(), timelineStart.getTime(), timelineEnd.getTime()),
      );
      const remainingDuration = timelineEnd.getTime() - start.getTime();
      const progress = clamp(remainingDuration / totalDuration, 0, 1);
      width.value = withTiming(progress);
      setRemainingTime(formatTimeDifferenceInDayHourMinute(start, timelineEnd));
    };
    updateRemainingTime();
    const startUpdating = () => {
      updateRemainingTime();
      const intervalId = setInterval(updateRemainingTime, 60000); // Update every minute
      return intervalId;
    };

    const timeoutId = setTimeout(() => {
      const intervalId = startUpdating();
      return intervalId;
    }, (60 - new Date().getSeconds()) * 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [timelineStart, timelineEnd, totalDuration, width]);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      width: `${width.value * 100}%`,
    };
  });

  const remainingTimeTextStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        width.value,
        [0, 1],
        [COLOR.red[50], COLOR.green[60]],
      ),
    };
  });

  return (
    <View style={[flex.flexCol, gap.xsmall2]}>
      <Text
        className="text-center font-medium"
        style={[font.size[10], self.center, textColor(COLOR.text.neutral.med)]}>
        {formatTimeDifferenceInDayHourMinute(
          new Date(timeline.start),
          new Date(timeline.end),
        )}
      </Text>
      <View
        style={[
          {height: 1.5},
          flex.flexRow,
          justify.end,
          background(COLOR.red[50]),
        ]}>
        <Animated.View
          style={[
            dimension.height.full,
            background(COLOR.green[60]),
            animatedStyles,
          ]}
        />
      </View>
      {remainingTime !== '' && (
        <Animated.Text
          className="font-bold"
          style={[self.center, font.size[10], remainingTimeTextStyle]}>
          {remainingTime}
        </Animated.Text>
      )}
    </View>
  );
};

export default CampaignTimelineScreen;

const styles = StyleSheet.create({
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[20],
  },
  approvedCardBorder: {
    borderWidth: 1,
    borderColor: COLOR.green[50],
  },
  pendingCardBorder: {
    borderWidth: 1,
    borderColor: COLOR.yellow[30],
  },
  rejectedCardBorder: {
    borderWidth: 1,
    borderColor: COLOR.red[60],
  },
});
