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
import {font, text} from '../../../styles/Font';
import {padding} from '../../../styles/Padding';
import {rounded} from '../../../styles/BorderRadius';
import {background} from '../../../styles/BackgroundColor';
import {COLOR} from '../../../styles/Color';
import {CustomButton} from '../../../components/atoms/Button';
import {border} from '../../../styles/Border';
import {textColor} from '../../../styles/Text';
import {
  formatDateToDayMonthYear,
  formatDateToHourMinute,
  formatTimeDifferenceInDayHourMinute,
} from '../../../utils/date';
import StatusTag, {StatusType} from '../../../components/atoms/StatusTag';
import {
  BasicStatus,
  Transaction,
  TransactionStatus,
  transactionStatusCampaignStepMap,
  transactionStatusIndexMap,
  transactionStatusStepperStateMap,
  transactionStatusTypeMap,
} from '../../../model/Transaction';
import {LoadingScreen} from '../../LoadingScreen';
import {shadow} from '../../../styles/Shadow';
import {ScrollView} from 'react-native-gesture-handler';
import {dimension} from '../../../styles/Dimension';
import FastImage from 'react-native-fast-image';
import {User} from '../../../model/User';
import {AnimatedPressable} from '../../../components/atoms/AnimatedPressable';
import {clamp, formatNumberWithThousandSeparator} from '../../../utils/number';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {InternalLink} from '../../../components/atoms/Link';
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
import {overflow} from '../../../styles/Overflow';
import {showToast} from '../../../helpers/toast';
import {ToastType} from '../../../providers/ToastProvider';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignTimeline
>;

type CampaignTimelineMap = {
  [key in CampaignStep]?: CampaignTimeline;
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
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>();
  const [activeImageClicked, setActiveImageClicked] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const currentActiveTimeline = useMemo(() => {
    return campaign?.getActiveTimeline();
  }, [campaign]);

  useEffect(() => {
    Campaign.getById(campaignId)
      .then(setCampaign)
      .catch(() => setCampaign(null));
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

  const pendingRegistrants = useMemo(
    () =>
      transactions.filter(
        t => t.transaction.status === TransactionStatus.registrationPending,
      ),
    [transactions],
  );

  const currentActiveIndex = useMemo(() => {
    if (transaction?.isTerminated()) {
      return 0;
    }
    const filteredCampaignStep = Object.values(CampaignStep).filter(step =>
      campaign?.timeline?.some(timeline => timeline.step === step),
    );
    if (currentActiveTimeline) {
      return filteredCampaignStep.indexOf(currentActiveTimeline?.step);
    }
    return filteredCampaignStep.length + 1;
  }, [currentActiveTimeline, campaign, transaction]);

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

  const getIndexOffset = useCallback(() => {
    if (!campaign) {
      return 0;
    }

    const nowTime = new Date().getTime();
    const campaignSteps = Object.values(CampaignStep);

    const sortedPassedTimeline = campaign.timeline
      .sort((timelineA, timelineB) => timelineA.start - timelineB.start)
      .filter(timeline => nowTime >= timeline.start);

    if (sortedPassedTimeline.length === 0) {
      return 0;
    }

    const latestPassedTimeline =
      sortedPassedTimeline[sortedPassedTimeline.length - 1];

    const missingSteps = campaignSteps.filter(
      step =>
        !sortedPassedTimeline.find(timeline => timeline.step === step) &&
        campaignIndexMap[step] < campaignIndexMap[latestPassedTimeline.step],
    );

    return missingSteps.length;
  }, [campaign]);

  const stepperStates = useMemo(() => {
    if (!campaign || !transaction?.status) {
      return [];
    }

    const numberOfSteps =
      campaignIndexMap[
        currentActiveTimeline?.step || CampaignStep.Registration
      ] +
      1 -
      getIndexOffset();

    if (transaction.isTerminated()) {
      return Array(numberOfSteps).fill(StepperState.terminated);
    }

    if (transaction.isCompleted() || campaign.isCompleted()) {
      console.log('iscompleted');
      return Array(campaignIndexMap[CampaignStep.Completed]).fill(
        StepperState.success,
      );
    }

    if (isCampaignOwner && currentActiveTimeline) {
      return Array(numberOfSteps).fill(StepperState.success);
    }

    const currentTransactionStep =
      transactionStatusCampaignStepMap[transaction.status];
    const isContentCreatorNotDoneActiveTimeline =
      currentActiveTimeline &&
      currentTransactionStep !== currentActiveTimeline.step;

    const steps = Array(numberOfSteps).fill(StepperState.success);

    steps[steps.length - 1] =
      transactionStatusStepperStateMap[transaction.status];

    if (isContentCreatorNotDoneActiveTimeline) {
      steps[steps.length - 1] = StepperState.inProgress;
    }

    return steps;
  }, [
    campaign,
    transaction,
    currentActiveTimeline,
    isCampaignOwner,
    getIndexOffset,
  ]);

  const registerCampaign = () => {
    if (uid && campaign?.userId) {
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
          console.log('Joined!');
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

  const navigateToSubmissionModal = () => {
    if (!transaction?.id || isCampaignOwner) {
      return;
    }
    const getNavigation = () => {
      if (transaction?.isWaitingBrainstormSubmission()) {
        return AuthenticatedNavigation.SubmitBrainstorm;
      }
      if (transaction?.isWaitingContentSubmission()) {
        return AuthenticatedNavigation.SubmitContentCreation;
      }
      if (transaction?.isWaitingEngagementSubmission()) {
        return AuthenticatedNavigation.SubmitResult;
      }
      return null;
    };
    const targetNavigation = getNavigation();
    if (!targetNavigation) {
      return;
    }
    navigation.navigate(targetNavigation, {
      transactionId: transaction?.id,
    });
  };

  useEffect(() => {
    if (isCampaignOwner) {
      return Transaction.getAllTransactionsByCampaign(campaignId, t => {
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
      });
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

  if (campaign === undefined || transaction === undefined) {
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
        <View
          style={[
            flex.flexCol,
            gap.default,
            padding.top.xlarge3,
            padding.horizontal.default,
          ]}>
          <ContentStepper
            currentPosition={currentActiveIndex}
            stepperStates={stepperStates}
            decreasePreviousVisibility={!isCampaignOwner}
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
                      <View style={[flex.flexCol]}>
                        <Text
                          style={[
                            font.size[20],
                            font.weight.medium,
                            textColor(COLOR.text.neutral.high),
                          ]}>
                          {`${pendingRegistrants.length} Pending Registrants`}
                        </Text>
                        <Text
                          style={[
                            font.size[20],
                            textColor(COLOR.text.neutral.med),
                          ]}>{`${
                          transactions.filter(
                            t =>
                              t.transaction.status &&
                              transactionStatusIndexMap[t.transaction.status] >
                                campaignIndexMap[CampaignStep.Registration],
                          ).length
                        } registered`}</Text>
                      </View>
                      {pendingRegistrants && pendingRegistrants.length > 0 && (
                        <View style={[flex.flexRow]}>
                          {pendingRegistrants.slice(0, 5).map((t, i) => {
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
                                    zIndex: 6 - i,
                                  },
                                ]}>
                                <View
                                  style={[
                                    dimension.full,
                                    rounded.max,
                                    overflow.hidden,
                                  ]}>
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
                          {pendingRegistrants.length > 5 && (
                            <View
                              style={[
                                dimension.square.xlarge2,
                                rounded.max,
                                padding.xsmall,
                                background(COLOR.black[70]),
                                {
                                  zIndex: 6,
                                },
                              ]}>
                              <View
                                style={[
                                  dimension.full,
                                  overflow.hidden,
                                  flex.flexRow,
                                  justify.center,
                                  items.center,
                                  rounded.max,
                                ]}>
                                <Text
                                  style={[
                                    font.size[20],
                                    font.weight.black,
                                    textColor(COLOR.black[0]),
                                  ]}>
                                  {`${
                                    pendingRegistrants.length - 5 > 1
                                      ? `${pendingRegistrants.length - 6}+`
                                      : pendingRegistrants.length
                                  }`}
                                </Text>
                              </View>
                            </View>
                          )}
                        </View>
                      )}
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
                    <View style={[flex.flexRow, justify.between]}>
                      <Text
                        style={[
                          font.size[30],
                          font.weight.semibold,
                          textColor(COLOR.text.neutral.high),
                        ]}>
                        💡 Things to highlight
                      </Text>
                      {transaction?.status &&
                        transactionStatusCampaignStepMap[
                          transaction?.status
                        ] === CampaignStep.Brainstorming &&
                        transaction.brainstorms &&
                        transaction.brainstorms.length > 0 && (
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
                    <View style={[flex.flexCol, gap.xsmall]}>
                      <Text
                        style={[
                          font.size[30],
                          textColor(COLOR.text.neutral.default),
                        ]}>
                        {campaign?.description}
                      </Text>
                      {campaign?.importantInformation &&
                        campaign.importantInformation?.length > 0 &&
                        campaign.importantInformation.map((info, index) => {
                          return (
                            <Text
                              key={index}
                              style={[
                                font.size[30],
                                textColor(COLOR.text.neutral.default),
                              ]}>
                              {info}
                            </Text>
                          );
                        })}
                    </View>
                  </View>
                  {isCampaignOwner && (
                    <>
                      <View
                        style={[dimension.width.full, styles.headerBorder]}
                      />
                      <View style={[flex.flexCol, gap.default]}>
                        <View style={[flex.flexRow, justify.between]}>
                          <View style={[flex.flexCol]}>
                            <Text
                              style={[
                                font.size[20],
                                font.weight.medium,
                                textColor(COLOR.text.neutral.med),
                              ]}>
                              {`${filteredPendingBrainstormApproval.length} review needed`}
                            </Text>
                            <Text
                              style={[
                                font.size[20],
                                textColor(COLOR.text.neutral.med),
                              ]}>{`${
                              transactions.filter(t => {
                                const latestSubmission =
                                  t.transaction.getLatestBrainstorm();
                                return (
                                  latestSubmission &&
                                  latestSubmission.status ===
                                    BasicStatus.approved
                                );
                              }).length
                            } completed`}</Text>
                          </View>
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
                        {filteredPendingBrainstormApproval.length > 0 && <></>}
                      </View>
                    </>
                  )}
                  {!isCampaignOwner &&
                    transaction?.isWaitingBrainstormSubmission() && (
                      <CustomButton
                        text="Submit idea"
                        onPress={navigateToSubmissionModal}
                      />
                    )}
                </View>
              </View>
            )}
            {campaignTimelineMap?.[CampaignStep.ContentCreation] && (
              <View
                style={[
                  flex.flexCol,
                  shadow.medium,
                  rounded.medium,
                  background(COLOR.black[0]),
                ]}>
                <View style={[flex.flexCol, styles.headerBorder]}>
                  <StepperLabel
                    timeline={campaignTimelineMap[CampaignStep.ContentCreation]}
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
                          style={[
                            font.size[30],
                            font.weight.semibold,
                            textColor(COLOR.text.neutral.high),
                          ]}>
                          Your task
                        </Text>
                        {transaction?.status &&
                          transactionStatusCampaignStepMap[
                            transaction?.status
                          ] === CampaignStep.ContentCreation &&
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
                                style={[
                                  font.size[20],
                                  font.weight.semibold,
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
                    {!isCampaignOwner &&
                      transaction?.isWaitingContentSubmission() && (
                        <View style={[padding.horizontal.default]}>
                          <CustomButton
                            text="Upload"
                            onPress={navigateToSubmissionModal}
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
                        style={[
                          font.size[20],
                          font.weight.medium,
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
            {campaignTimelineMap?.[CampaignStep.ResultSubmission] && (
              <View style={[flex.flexCol, shadow.medium, rounded.medium]}>
                <View style={[flex.flexCol, styles.headerBorder]}>
                  <StepperLabel
                    timeline={
                      campaignTimelineMap[CampaignStep.ResultSubmission]
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
                      style={[
                        font.size[30],
                        font.weight.semibold,
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      Guideline
                    </Text>
                    {transaction?.status &&
                      transactionStatusCampaignStepMap[transaction?.status] ===
                        CampaignStep.ResultSubmission &&
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
                        style={[
                          overflow.hidden,
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
                  {!isCampaignOwner &&
                    transaction?.isWaitingEngagementSubmission() && (
                      <CustomButton
                        text="Upload"
                        onPress={navigateToSubmissionModal}
                      />
                    )}
                </View>
              </View>
            )}
          </ContentStepper>
        </View>
      </PageWithBackButton>
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
          style={[
            font.size[40],
            font.weight.semibold,
            textColor(COLOR.text.neutral.high),
          ]}
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
            style={[
              font.size[30],
              font.weight.semibold,
              textColor(COLOR.text.neutral.high),
            ]}
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
            style={[
              font.size[30],
              font.weight.semibold,
              textColor(COLOR.text.neutral.high),
            ]}
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
        style={[
          font.size[10],
          text.center,
          font.weight.medium,
          self.center,
          textColor(COLOR.text.neutral.med),
        ]}>
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
          style={[
            self.center,
            font.size[10],
            font.weight.bold,
            remainingTimeTextStyle,
          ]}>
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
