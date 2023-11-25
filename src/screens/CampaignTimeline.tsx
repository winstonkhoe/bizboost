import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {EffectCallback, useEffect, useMemo, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import {Campaign, CampaignStep} from '../model/Campaign';

import {useUser} from '../hooks/user';

import {PageWithBackButton} from '../components/templates/PageWithBackButton';
import {Link, useNavigation} from '@react-navigation/native';
import {flex, items, justify, self} from '../styles/Flex';
import {gap} from '../styles/Gap';
import {Stepper} from '../components/atoms/Stepper';
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
} from '../utils/date';
import StatusTag, {StatusType} from '../components/atoms/StatusTag';
import {
  BasicStatus,
  Transaction,
  TransactionStatus,
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
import ChevronRight from '../assets/vectors/chevron-right.svg';
import {User} from '../model/User';
import {AnimatedPressable} from '../components/atoms/AnimatedPressable';
import {formatNumberWithThousandSeparator} from '../utils/number';
import {KeyboardAvoidingContainer} from '../containers/KeyboardAvoidingContainer';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useKeyboard} from '../hooks/keyboard';
import {InternalLink} from '../components/atoms/Link';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.CampaignTimeline
>;

type CampaignTimelineMap = {
  [key in CampaignStep]?: {
    start: number;
    end: number;
  };
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
  const [isConfirmBrainstormModalOpened, setIsConfirmBrainstormModalOpened] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentActiveTimeline = useMemo(() => {
    const now = new Date().getTime();
    return campaign?.timeline?.find(
      timeline => now >= timeline.start && now <= timeline.end,
    );
  }, [campaign]);
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
          start: currentTimeline.start,
          end: currentTimeline.end,
        };
        return accumulated;
      }, {} as CampaignTimelineMap),
    [campaign],
  );

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
        .then(isSuccess => {
          if (isSuccess) {
            console.log('Joined!');
          }
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

  useEffect(() => {
    Campaign.getById(campaignId).then(c => setCampaign(c));
  }, [campaignId]);

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
            <Stepper
              type="content"
              currentPosition={currentActiveIndex}
              decreasePreviousVisibility={!isCampaignOwner}
              // currentPosition={0}
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
                    <View style={[flex.flexCol]}>
                      <Text
                        className="font-semibold"
                        style={[
                          font.size[40],
                          textColor(COLOR.text.neutral.high),
                        ]}
                        numberOfLines={1}>
                        {CampaignStep.Registration}
                      </Text>
                      <Text
                        style={[
                          font.size[20],
                          textColor(COLOR.text.neutral.high),
                        ]}
                        numberOfLines={1}>
                        {`${formatDateToDayMonthYear(
                          new Date(
                            campaignTimelineMap[
                              CampaignStep.Registration
                            ].start,
                          ),
                        )} - ${formatDateToDayMonthYear(
                          new Date(
                            campaignTimelineMap[CampaignStep.Registration].end,
                          ),
                        )}`}
                      </Text>
                    </View>
                    {isCampaignOwner ? (
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
                      transaction?.status &&
                      transaction.status !==
                        TransactionStatus.notRegistered && (
                        <StatusTag
                          status={transaction?.status}
                          statusType={
                            transactionStatusTypeMap[transaction?.status]
                          }
                        />
                      )
                    )}
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
                        <ChevronRight fill={COLOR.black[20]} />
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
                    <Text
                      className="font-semibold"
                      style={[font.size[40]]}
                      numberOfLines={1}>
                      {CampaignStep.Brainstorming}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {`${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[CampaignStep.Brainstorming].start,
                        ),
                      )} - ${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[CampaignStep.Brainstorming].end,
                        ),
                      )}`}
                    </Text>
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
                              Pending Approval
                            </Text>
                            <InternalLink
                              size={30}
                              text="See all"
                              onPress={() => {
                                navigateToDetail(
                                  TransactionStatus.brainstormSubmitted,
                                );
                              }}
                            />
                          </View>
                          <ScrollView
                            horizontal
                            contentContainerStyle={[flex.flexRow, gap.default]}>
                            {transactions
                              .filter(
                                t =>
                                  t.transaction?.getLatestBrainstorm() !== null,
                              )
                              .sort(
                                (a, b) =>
                                  a.transaction.getLatestBrainstorm()!!
                                    .createdAt -
                                  b.transaction?.getLatestBrainstorm()!!
                                    .createdAt,
                              )
                              .reverse()
                              .map(t => {
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
                                      styles.cardBorder,
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
                              Previous Submission
                            </Text>
                            <ScrollView
                              horizontal
                              contentContainerStyle={[
                                flex.flexRow,
                                gap.default,
                              ]}>
                              {transaction.brainstorms.map(brainstorm => {
                                return (
                                  <View
                                    key={brainstorm.createdAt}
                                    style={[
                                      flex.flex1,
                                      flex.flexCol,
                                      justify.around,
                                      gap.default,
                                      styles.cardBorder,
                                      padding.default,
                                      rounded.default,
                                      dimension.width.xlarge14,
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
                                          background(COLOR.red[5], 0.3),
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
                    <Text
                      className="font-semibold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {CampaignStep.ContentSubmission}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {`${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.ContentSubmission
                          ].start,
                        ),
                      )} - ${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.ContentSubmission
                          ].end,
                        ),
                      )}`}
                    </Text>
                  </View>
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
                    <CustomButton text="Upload" />
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
                    <Text
                      className="font-semibold"
                      style={[
                        font.size[40],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {CampaignStep.EngagementResultSubmission}
                    </Text>
                    <Text
                      style={[
                        font.size[20],
                        textColor(COLOR.text.neutral.high),
                      ]}
                      numberOfLines={1}>
                      {`${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.EngagementResultSubmission
                          ].start,
                        ),
                      )} - ${formatDateToDayMonthYear(
                        new Date(
                          campaignTimelineMap[
                            CampaignStep.EngagementResultSubmission
                          ].end,
                        ),
                      )}`}
                    </Text>
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
            </Stepper>
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
              text="Cancel"
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
    </>
  );
};

export default CampaignTimelineScreen;

const styles = StyleSheet.create({
  headerBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[20],
  },
  cardBorder: {
    borderWidth: 1,
    borderColor: COLOR.green[20],
  },
});
