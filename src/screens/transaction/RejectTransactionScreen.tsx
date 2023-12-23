import {ReactNode, useEffect, useRef, useState} from 'react';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {LoadingScreen} from '../LoadingScreen';
import {
  Pressable,
  PressableProps,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import PagerView from 'react-native-pager-view';
import {padding} from '../../styles/Padding';
import {gap} from '../../styles/Gap';
import {flex, items, justify, self} from '../../styles/Flex';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomButton} from '../../components/atoms/Button';
import {size} from '../../styles/Size';
import {
  RejectionType,
  Transaction,
  TransactionStatus,
  rejectionTypeLabelMap,
  transactionStatusCampaignStepMap,
} from '../../model/Transaction';
import {shadow} from '../../styles/Shadow';
import {rounded} from '../../styles/BorderRadius';
import {dimension} from '../../styles/Dimension';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {
  BrokenLinkIcon,
  MissingDocumentIcon,
  PhotoRevisionIcon,
} from '../../components/atoms/Icon';
import {border} from '../../styles/Border';
import {background} from '../../styles/BackgroundColor';
import {chunkArray} from '../../utils/array';
import {AnimatedPressable} from '../../components/atoms/AnimatedPressable';
import {FormlessCustomTextInput} from '../../components/atoms/Input';
import {Seperator} from '../../components/atoms/Separator';
import {
  BrainstormSubmissionCard,
  ContentSubmissionCard,
  EngagementSubmissionCard,
} from './TransactionDetailScreen';
import {KeyboardAvoidingContainer} from '../../containers/KeyboardAvoidingContainer';
import {useNavigation} from '@react-navigation/native';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {BackButtonLabel} from '../../components/atoms/Header';
import {CampaignStep} from '../../model/Campaign';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.RejectTransaction
>;

enum RejectTransactionPage {
  ChooseRejectType = 0,
  RejectReason = 1,
}

const rules = {
  rejectReason: {
    min: 20,
    max: 500,
  },
};

interface rejectionType {
  type: RejectionType;
  icon: ReactNode;
}

type rejectionTypesMap = {
  [key in CampaignStep]?: rejectionType[];
};

const rejectionTypes: rejectionTypesMap = {
  [CampaignStep.Brainstorming]: [
    {
      type: RejectionType.contentMismatch,
      icon: (
        <MissingDocumentIcon
          size="xlarge"
          strokeWidth={1.3}
          color={COLOR.red[70]}
        />
      ),
    },
  ],
  [CampaignStep.ContentCreation]: [
    {
      type: RejectionType.unreachableLink,
      icon: <BrokenLinkIcon size="xlarge2" color={COLOR.green[60]} />,
    },
    {
      type: RejectionType.contentMismatch,
      icon: <PhotoRevisionIcon size="xlarge2" color={COLOR.green[60]} />,
    },
    {
      type: RejectionType.incompleteSubmission,
      icon: (
        <MissingDocumentIcon
          size="xlarge"
          strokeWidth={1.3}
          color={COLOR.red[70]}
        />
      ),
    },
  ],
  [CampaignStep.ResultSubmission]: [
    {
      type: RejectionType.unreachableLink,
      icon: <BrokenLinkIcon size="xlarge2" color={COLOR.green[60]} />,
    },
    {
      type: RejectionType.incompleteSubmission,
      icon: (
        <MissingDocumentIcon
          size="xlarge"
          strokeWidth={1.3}
          color={COLOR.red[70]}
        />
      ),
    },
  ],
};

const RejectTransactionScreen = ({route}: Props) => {
  const {transactionId} = route.params;
  const safeAreaInsets = useSafeAreaInsets();
  const windowDimension = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();
  const [selectedRejectionType, setSelectedRejectionType] =
    useState<RejectionType | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [transaction, setTransaction] = useState<Transaction | null>();
  const pagerViewRef = useRef<PagerView>(null);
  const [activePage, setActivePage] = useState<RejectTransactionPage>(
    RejectTransactionPage.ChooseRejectType,
  );

  useEffect(() => {
    const unsubscribe = Transaction.getById(transactionId, setTransaction);
    return unsubscribe;
  }, [transactionId]);

  useEffect(() => {
    if (pagerViewRef.current) {
      pagerViewRef.current.setPage(activePage);
    }
  }, [activePage]);

  const handleReject = () => {
    if (transaction && rejectReason.length > 0) {
      setIsLoading(true);
      transaction
        .reject({
          type: selectedRejectionType!!,
          reason: rejectReason,
        })
        .then(() => {
          setIsLoading(false);
          navigation.canGoBack() && navigation.goBack();
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  };

  if (transaction === undefined) {
    return <LoadingScreen />;
  }

  //TODO: handle null transaction, show error and let user to go back by backbutton i think is ok
  if (transaction === null) {
    return null;
  }

  return (
    <>
      {isLoading && <LoadingScreen />}
      <PageWithBackButton
        fullHeight
        threshold={0}
        withoutScrollView
        onPress={() => {
          setActivePage(activePage - 1);
        }}
        disableDefaultOnPress={
          activePage > RejectTransactionPage.ChooseRejectType
        }
        backButtonPlaceholder={
          <BackButtonLabel
            text={`Reject ${
              transactionStatusCampaignStepMap[transaction.status!!] ||
              'Transaction'
            }`}
          />
        }>
        <PagerView
          style={[flex.flex1, flex.grow]}
          ref={pagerViewRef}
          initialPage={activePage}
          scrollEnabled={false}>
          <View
            key={RejectTransactionPage.ChooseRejectType}
            style={[flex.flex1, flex.flexCol]}>
            <ScrollView
              bounces={true}
              showsVerticalScrollIndicator={false}
              alwaysBounceVertical
              style={[flex.flex1]}
              contentContainerStyle={[
                flex.flex1,
                flex.flexCol,
                padding.horizontal.default,
                {paddingTop: safeAreaInsets.top + size.xlarge5},
                {paddingBottom: Math.max(safeAreaInsets.bottom, size.default)},
                gap.large,
              ]}>
              <View style={[flex.flexCol]}>
                <Text
                  className="font-bold"
                  style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                  Choose Rejection Type
                </Text>
                <Text
                  style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                  Please choose one of the issues that requires revision.
                </Text>
              </View>
              <View style={[flex.flexRow, justify.center]}>
                <View
                  style={[flex.flexCol, flex.wrap, justify.center, gap.medium]}>
                  {chunkArray(
                    rejectionTypes[
                      transactionStatusCampaignStepMap[transaction.status!!]!!
                    ] || [],
                    2,
                  ).map((rejectionTypeChunk, rejectionTypeChunkIndex) => (
                    <View
                      key={rejectionTypeChunkIndex}
                      style={[flex.flexRow, gap.medium]}>
                      {rejectionTypeChunk.map(rejectionType => {
                        const revisionIsDisabled =
                          rejectionType.type ===
                            RejectionType.contentMismatch &&
                          transaction.getRemainingRevisionCount() <= 0;
                        return (
                          <RejectTypeCard
                            key={rejectionType.type}
                            isSelected={
                              rejectionType.type === selectedRejectionType
                            }
                            isDisabled={revisionIsDisabled}
                            rejectionType={rejectionType.type}
                            onPress={() => {
                              if (!revisionIsDisabled) {
                                setSelectedRejectionType(rejectionType.type);
                              }
                              if (revisionIsDisabled) {
                                showToast({
                                  message:
                                    'Content creators have reached the revision limit.',
                                  type: ToastType.danger,
                                });
                              }
                            }}>
                            {rejectionType.icon}
                          </RejectTypeCard>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
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
                  text="Choose"
                  disabled={selectedRejectionType === null}
                  onPress={() => {
                    setActivePage(RejectTransactionPage.RejectReason);
                  }}
                />
              </View>
            </View>
          </View>
          <View
            key={RejectTransactionPage.RejectReason}
            style={[flex.flex1, flex.flexCol]}>
            <KeyboardAvoidingContainer>
              <ScrollView
                bounces={true}
                showsVerticalScrollIndicator={false}
                alwaysBounceVertical
                style={[flex.flex1]}
                contentContainerStyle={[
                  flex.flex1,
                  flex.flexCol,
                  {paddingTop: safeAreaInsets.top + size.xlarge5},
                  {
                    paddingBottom: Math.max(
                      safeAreaInsets.bottom,
                      size.default,
                    ),
                  },
                  gap.large,
                ]}>
                <View
                  style={[
                    flex.flexCol,
                    gap.default,
                    padding.horizontal.default,
                  ]}>
                  <Text
                    className="font-bold"
                    style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                    {selectedRejectionType}
                  </Text>
                  {transaction.status &&
                    transaction.status ===
                      TransactionStatus.brainstormSubmitted && (
                      <BrainstormSubmissionCard
                        hideStatus
                        transaction={transaction}
                        content={transaction.getLatestBrainstorm()!!}
                      />
                    )}
                  {transaction.status &&
                    transaction.status ===
                      TransactionStatus.contentSubmitted && (
                      <ContentSubmissionCard
                        hideStatus
                        transaction={transaction}
                        content={transaction.getLatestContentSubmission()!!}
                      />
                    )}
                  {transaction.status &&
                    transaction.status ===
                      TransactionStatus.engagementSubmitted && (
                      <EngagementSubmissionCard
                        hideStatus
                        transaction={transaction}
                        engagement={
                          transaction.getLatestEngagementSubmission()!!
                        }
                      />
                    )}
                </View>
                <Seperator />
                <View
                  style={[
                    flex.flexCol,
                    gap.default,
                    padding.horizontal.default,
                  ]}>
                  <FormFieldHelper title="Reject reason" />
                  <FormlessCustomTextInput
                    type="textarea"
                    description={`Min. ${rules.rejectReason.min}, Max. ${rules.rejectReason.max} characters. `}
                    max={rules.rejectReason.max}
                    counter
                    onChange={setRejectReason}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingContainer>
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
                  disabled={rejectReason.length < rules.rejectReason.min}
                  text="Reject"
                  onPress={handleReject}
                />
              </View>
            </View>
          </View>
        </PagerView>
      </PageWithBackButton>
    </>
  );
};

interface RejectTypeCardProps extends PressableProps {
  rejectionType: RejectionType;
  isSelected?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
}

const RejectTypeCard = ({
  rejectionType,
  isSelected,
  isDisabled,
  children,
  ...props
}: RejectTypeCardProps) => {
  return (
    <Pressable
      style={[
        flex.flexCol,
        padding.default,
        rounded.default,
        dimension.width.xlarge9,
        !isSelected && [
          {
            borderWidth: 1,
            borderColor: 'transparent',
          },
        ],
        isSelected && [
          border({
            borderWidth: 1,
            color: COLOR.green[50],
          }),
          background(COLOR.green[5]),
        ],
      ]}
      {...props}>
      <View
        style={[
          flex.flexRow,
          justify.center,
          items.center,
          dimension.height.xlarge2,
          isDisabled && {
            opacity: 0.3,
          },
        ]}>
        {children}
      </View>
      <Text
        className="font-bold text-center"
        style={[
          font.size[30],
          self.center,
          textColor(COLOR.text.neutral.high),
          isDisabled && textColor(COLOR.text.neutral.low),
        ]}>
        {rejectionTypeLabelMap[rejectionType]}
      </Text>
    </Pressable>
  );
};

export default RejectTransactionScreen;

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
