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
} from '../navigation/StackNavigation';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {
  Campaign,
  CampaignStep,
  CampaignTimeline,
  campaignIndexMap,
} from '../model/Campaign';

import {useUser} from '../hooks/user';

import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {Link, useNavigation} from '@react-navigation/native';
import {flex, items, justify, self} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {ContentStepper, StepperState} from '../components/atoms/Stepper';
import {font} from '../styles/Font';
import {HorizontalPadding} from '../components/atoms/ViewPadding';
import {padding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {background} from '../styles/BackgroundColor';
import {COLOR} from '../styles/Color';
import {CustomButton} from '../components/atoms/Button';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';
import {
  formatDateToDayMonthYear,
  formatDateToDayMonthYearHourMinute,
  formatDateToHourMinute,
  formatTimeDifferenceInDayHourMinute,
} from '../utils/date';
import StatusTag, {StatusType} from '../components/atoms/StatusTag';
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
} from '../model/Transaction';
import {LoadingScreen} from './LoadingScreen';
import {shadow} from '../styles/Shadow';
import {SheetModal} from '../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../components/templates/BottomSheetModalWithTitle';
import {FormlessCustomTextInput} from '../components/atoms/Input';
import {FormFieldHelper} from '../components/atoms/FormLabel';
import {ScrollView} from 'react-native-gesture-handler';
import {dimension} from '../styles/Dimension';
import {CustomModal} from '../components/atoms/CustomModal';
import FastImage from 'react-native-fast-image';
import {SocialPlatform, User} from '../model/User';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import {formatNumberWithThousandSeparator} from '../utils/number';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useKeyboard} from '../hooks/keyboard';
import {InternalLink} from '../components/atoms/Link';
import FieldArray from '../components/organisms/FieldArray';
import {FormProvider, useForm} from 'react-hook-form';
import {StringObject, getStringObjectValue} from '../utils/stringObject';
import {ArrowIcon, ChevronRight} from '../components/atoms/Icon';

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

interface TransactionView {
  transaction: Transaction;
  contentCreator: User | null;
}

const CampaignTimelineScreen = ({route}: Props) => {
  const {uid} = useUser();
  const keyboardHeight = useKeyboard();
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const navigation = useNavigation<NavigationStackProps>();
  const {campaignId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transactions, setTransactions] = useState<TransactionView[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
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

  const methods = useForm<SubmissionFormData>({
    defaultValues: {
      submission: [],
    },
  });

  const {reset, control, watch, getValues} = methods;

  const sub = watch('submission');
  useEffect(() => {
    console.log('submission', sub);
  }, [sub]);

  const resetOriginalField = useCallback(() => {
    reset({
      submission: transaction?.platformTasks?.map(platformTask => {
        return {
          platform: platformTask.name,
          tasks: [],
        };
      }),
    });
  }, [reset, transaction]);

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
        const campaignHaveBrainstorming =
          campaign.timeline?.find(
            timeline => CampaignStep.Brainstorming === timeline.step,
          ) !== undefined;
        const indexOffset = !campaignHaveBrainstorming
          ? Math.abs(
              campaignIndexMap[CampaignStep.Brainstorming] -
                campaignIndexMap[CampaignStep.ContentSubmission],
            )
          : 0;
        const calculatedTransactionStatusIndex =
          transactionStatusIndex >=
          transactionStatusIndexMap[TransactionStatus.brainstormApproved]
            ? transactionStatusIndex - indexOffset
            : transactionStatusIndex;
        let steps = [
          ...Array(
            (calculatedTransactionStatusIndex <= 0
              ? 0
              : calculatedTransactionStatusIndex) +
              (currentActiveTimeline &&
              calculatedTransactionStatusIndex <=
                campaignIndexMap[currentActiveTimeline?.step]
                ? 1
                : 0),
          ),
        ].map(() => StepperState.success);
        console.log(
          'calculatedtransactionstatusindex',
          calculatedTransactionStatusIndex,
        );
        steps[steps.length - 1] =
          transactionStatusStepperStateMap[transaction.status];
        const currentTransactionStep =
          transactionStatusCampaignStepMap[transaction.status];
        console.log(currentTransactionStep);
        if (
          currentActiveTimeline &&
          currentTransactionStep !== currentActiveTimeline?.step
        ) {
          steps[campaignIndexMap[currentActiveTimeline.step] - indexOffset] =
            StepperState.inProgress;
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
    const data = methods.getValues();
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

  if (!campaign) {
    return <LoadingScreen />;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
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
                      padding.default,
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
                                      source={
                                        t.contentCreator?.contentCreator
                                          ?.profilePicture
                                          ? {
                                              uri: t.contentCreator
                                                ?.contentCreator
                                                ?.profilePicture,
                                            }
                                          : require('../assets/images/bizboost-avatar.png')
                                      }
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
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      styles.headerBorder,
                    ]}>
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
                                        navigation.navigate(
                                          AuthenticatedNavigation.TransactionDetail,
                                          {
                                            transactionId: t.transaction.id,
                                          },
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
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      styles.headerBorder,
                    ]}>
                    <StepperLabel
                      timeline={
                        campaignTimelineMap[CampaignStep.ContentSubmission]
                      }
                    />
                  </View>
                  {isCampaignOwner ? <></> : <></>}
                  <View style={[flex.flexCol, gap.small, padding.default]}>
                    <View style={[flex.flexRow, justify.between, items.center]}>
                      <Text className="font-semibold" style={[font.size[30]]}>
                        Revision needed!
                      </Text>
                      <Text style={[font.size[20]]}>
                        Nov 19, 2023 16:20 WIB
                      </Text>
                    </View>
                    <Text>
                      {`1. The introduction should have a brief explanation about the brand and also please make the transition between shots smoother.\n2. The audio quality is kinda bad, please provide caption for it`}
                    </Text>
                    <CustomButton
                      text="Upload"
                      onPress={() => {
                        setIsContentSubmissionModalOpen(true);
                      }}
                    />
                  </View>
                </View>
              )}
              {campaignTimelineMap?.[
                CampaignStep.EngagementResultSubmission
              ] && (
                <View style={[flex.flexCol, shadow.medium, rounded.medium]}>
                  <View
                    style={[
                      flex.flexCol,
                      padding.default,
                      styles.headerBorder,
                    ]}>
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
                    <Text
                      className="font-semibold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      Submit your ideas!
                    </Text>
                    <View
                      style={[
                        flex.flexCol,
                        gap.default,
                        padding.default,
                        rounded.default,
                        background(`${COLOR.green[5]}`),
                      ]}>
                      <Text>💡 Things to highlight</Text>
                      <Text>
                        Features: Multiple compartments for organized packing
                        Water-resistant and weather-proof material Lightweight
                        and easy to carry Available in various sizes and colors
                        Tagline: “Travel with confidence with Koper Idaman
                        Petualang!”
                      </Text>
                    </View>
                    <CustomButton text="Submit idea" />
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
          title="Content Submission"
          type="modal"
          onPress={() => {
            setIsContentSubmissionModalOpen(false);
          }}>
          <FormProvider {...methods}>
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
                              title={`[${platform.name}] - ${task.quantity} x ${task.name}`}
                              description={task.description}
                              placeholder="Add url"
                              maxFieldLength={0}
                              helperText={`Make sure url is publicly accessible.\nEx. https://drive.google.com/file/d/1Go0RYsRgia9ZoMy10O8XBrfnIWMCopHs/view?usp=sharing`}
                              control={control}
                              fieldType="textarea"
                              type="required"
                              rules={{
                                required: 'URL is required',
                                pattern: {
                                  value: /^(http|https):\/\/[^ "]+$/i,
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
                          getValues(
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
    <View style={[flex.flex1, flex.flexCol, gap.medium]}>
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
          <View style={[flex.flexRow, justify.center]}>
            <Text
              className="text-center font-medium"
              style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
              {formatTimeDifferenceInDayHourMinute(
                new Date(timeline.start),
                new Date(timeline.end),
              )}
            </Text>
          </View>
          <View
            style={[
              {
                height: 1.5,
              },
              background(COLOR.black[30]),
            ]}
          />
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
