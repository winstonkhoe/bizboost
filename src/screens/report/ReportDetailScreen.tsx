import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  AuthenticatedNavigation,
  AuthenticatedStack,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {StyleSheet, View} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {
  ActionTaken,
  Report,
  actionTakenLabelMap,
  reportStatusTypeMap,
} from '../../model/Report';
import {LoadingScreen} from '../LoadingScreen';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {BackButtonLabel} from '../../components/atoms/Header';
import {flex, items, justify} from '../../styles/Flex';
import {ScrollView} from 'react-native';
import {useUser} from '../../hooks/user';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {Pressable} from 'react-native';
import StatusTag from '../../components/atoms/StatusTag';
import {formatDateToDayMonthYearHourMinute} from '../../utils/date';
import {User, UserRole} from '../../model/User';
import {Campaign} from '../../model/Campaign';
import {Transaction} from '../../model/Transaction';
import {CampaignDetailSection} from '../transaction/TransactionDetailScreen';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import {CustomButton} from '../../components/atoms/Button';
import {SheetModal} from '../../containers/SheetModal';
import {BottomSheetModalWithTitle} from '../../components/templates/BottomSheetModalWithTitle';
import {FormFieldHelper} from '../../components/atoms/FormLabel';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {FormlessCustomTextInput} from '../../components/atoms/Input';
import PagerView from 'react-native-pager-view';
import {ChevronRight} from '../../components/atoms/Icon';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {Seperator} from '../../components/atoms/Separator';
import {background} from '../../styles/BackgroundColor';
import {ContentCreatorSection} from '../../components/molecules/ContentCreatorSection';
import {InternalLink} from '../../components/atoms/Link';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {getSourceOrDefaultAvatar} from '../../utils/asset';

type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.ReportDetail
>;

const ReportDetailScreen = ({route}: Props) => {
  const {reportId} = route.params;
  const {uid, user, activeRole} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [reportIndex, setReportIndex] = useState(0);
  const [isReportSheetModalOpen, setIsReportSheetModalOpen] =
    useState<boolean>(false);
  const [actionTakenReason, setActionTakenReason] = useState<string>('');
  const [warningNotes, setWarningNotes] = useState<string>('');
  const [selectedActionTaken, setSelectedActionTaken] = useState<ActionTaken>();
  const reportViewPagerRef = useRef<PagerView>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [reporterUser, setReporterUser] = useState<User | null>(null);
  const [reportedUser, setReportedUser] = useState<User | null>(null);
  const isAdmin = activeRole === UserRole.Admin;
  const isReporterCampaignOwner =
    transaction?.businessPeopleId === report?.reporterId;

  useEffect(() => {
    return Report.getById(reportId, setReport);
  }, [reportId]);

  useEffect(() => {
    if (report?.transactionId) {
      return Transaction.getById(report.transactionId, setTransaction);
    }
  }, [report]);

  useEffect(() => {
    if (transaction?.campaignId) {
      Campaign.getById(transaction.campaignId)
        .then(setCampaign)
        .catch(() => {
          setCampaign(null);
        });
    }
  }, [transaction]);

  useEffect(() => {
    if (report?.reporterId) {
      User.getById(report.reporterId)
        .then(setReporterUser)
        .catch(() => {
          setReporterUser(null);
        });
    }
    if (report?.reportedId) {
      User.getById(report.reportedId)
        .then(setReportedUser)
        .catch(() => {
          setReportedUser(null);
        });
    }
  }, [report]);

  const selectActionTaken = (actionTaken: ActionTaken) => {
    setSelectedActionTaken(actionTaken);
    reportViewPagerRef.current?.setPage(1);
  };

  const resolveReport = () => {
    if (!report) {
      return;
    }
    if (!selectedActionTaken) {
      showToast({
        type: ToastType.danger,
        message: 'Please select action first',
      });
      return;
    }
    setIsLoading(true);
    report
      .resolve(
        selectedActionTaken,
        actionTakenReason.length > 0 ? actionTakenReason : undefined,
        warningNotes.length > 0 ? warningNotes : undefined,
      )
      .then(() => {
        setIsLoading(false);
        setIsReportSheetModalOpen(false);
        showToast({
          type: ToastType.success,
          message: 'Report resolved',
        });
      })
      .catch(() => {
        setIsLoading(false);
        showToast({
          type: ToastType.danger,
          message: 'Failed to resolve report',
        });
      });
  };

  if (!report || !transaction || !campaign || !reportedUser || !reporterUser) {
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
          <View
            style={[flex.flex1, flex.flexRow, justify.between, items.center]}>
            <BackButtonLabel text="Report Detail" />
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
            {report.status && (
              <View style={[flex.flexRow, justify.between, items.center]}>
                <Text
                  style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                  Status
                </Text>
                <StatusTag
                  fontSize={20}
                  status={report.status}
                  statusType={reportStatusTypeMap[report.status]}
                />
                {/* <Pressable
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
                  {transaction.campaignId && (
                    <ChevronRight size="large" color={COLOR.black[30]} />
                  )}
                </Pressable> */}
              </View>
            )}
            {report.actionTaken && (
              <>
                <View style={[styles.bottomBorder]} />
                <View style={[flex.flexRow, justify.between, items.center]}>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                    Action Taken
                  </Text>
                  <InternalLink size={20} text={report.actionTaken} />
                </View>
              </>
            )}
            {report.createdAt && (
              <>
                <View style={[styles.bottomBorder]} />
                <View style={[flex.flexRow, justify.between, items.center]}>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                    Report Date
                  </Text>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    {formatDateToDayMonthYearHourMinute(
                      new Date(report.createdAt),
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
          <CampaignDetailSection
            businessPeople={
              isReporterCampaignOwner ? reporterUser : reportedUser
            }
            campaign={campaign}
          />
          {isReporterCampaignOwner && (
            <ContentCreatorSection
              title="Reported User"
              contentCreator={reportedUser}
            />
          )}
          <ReportDetailSection
            report={report}
            isReporterCampaignOwner={isReporterCampaignOwner}
            reportedUser={reportedUser!!}
            reporterUser={reporterUser!!}
          />
        </ScrollView>
        {isAdmin && report.isPending() && (
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
                text={'Resolve'}
                onPress={() => {
                  setIsReportSheetModalOpen(true);
                }}
              />
            </View>
          </View>
        )}
      </PageWithBackButton>
      <SheetModal
        open={isReportSheetModalOpen}
        onDismiss={() => {
          setIsReportSheetModalOpen(false);
        }}
        fullHeight
        enableHandlePanningGesture={false}
        enableOverDrag={false}
        overDragResistanceFactor={0}
        snapPoints={reportIndex === 0 ? [350] : ['90%', '100%']}
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
              <View style={[flex.flexCol]}>
                {Object.values(ActionTaken).map(actionTaken => {
                  const isTerminateTransactionDisabled =
                    actionTaken === ActionTaken.terminateTransaction &&
                    transaction.isTerminated();
                  const isTransactionDisabled =
                    actionTaken === ActionTaken.approveTransaction &&
                    !transaction.isApprovable();
                  const isActionDisabled =
                    isTransactionDisabled || isTerminateTransactionDisabled;
                  return (
                    <View key={actionTaken} style={[flex.flexCol]}>
                      <Pressable
                        style={[
                          flex.flexRow,
                          justify.between,
                          items.center,
                          padding.default,
                          isActionDisabled && [
                            background(COLOR.background.neutral.disabled),
                          ],
                        ]}
                        onPress={() => {
                          if (isTransactionDisabled) {
                            showToast({
                              type: ToastType.info,
                              message:
                                'Transaction is not approvable. Please check the transaction status',
                            });
                            return;
                          }
                          if (isTerminateTransactionDisabled) {
                            showToast({
                              type: ToastType.info,
                              message:
                                'Transaction is already terminated. Please check the transaction status',
                            });
                            return;
                          }
                          selectActionTaken(actionTaken);
                        }}>
                        <Text
                          className="font-medium"
                          style={[
                            font.size[30],
                            textColor(COLOR.text.neutral.high),
                            isActionDisabled && [
                              textColor(COLOR.text.neutral.disabled),
                            ],
                          ]}>
                          {actionTaken}
                        </Text>
                        <ChevronRight
                          strokeWidth={1}
                          size="medium"
                          color={
                            isActionDisabled
                              ? COLOR.text.neutral.disabled
                              : COLOR.text.neutral.high
                          }
                        />
                      </Pressable>
                      <View style={[styles.bottomBorder]} />
                    </View>
                  );
                })}
              </View>
            </View>
            <View
              key={1}
              style={[flex.grow, flex.flexCol, gap.medium, padding.top.medium]}>
              {selectedActionTaken && (
                <View
                  style={[
                    flex.flexCol,
                    gap.xsmall,
                    padding.horizontal.default,
                  ]}>
                  <Text
                    className="font-bold"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    {`${selectedActionTaken} Action Plan`}
                  </Text>
                  <Text
                    style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                    {actionTakenLabelMap[selectedActionTaken]}
                  </Text>
                </View>
              )}
              <View style={[flex.flex1, flex.flexCol, gap.small]}>
                <BottomSheetScrollView
                  style={[flex.flex1, flex.flexCol]}
                  contentContainerStyle={[
                    flex.flexCol,
                    gap.small,
                    padding.horizontal.default,
                  ]}
                  stickyHeaderIndices={[1, 3]}>
                  <View style={[flex.flexRow, gap.small, items.start]}>
                    <View
                      className="overflow-hidden"
                      style={[dimension.square.large, rounded.max]}>
                      <FastImage
                        source={getSourceOrDefaultAvatar({
                          uri: isReporterCampaignOwner
                            ? reporterUser.businessPeople?.profilePicture
                            : reporterUser.contentCreator?.profilePicture,
                        })}
                        style={[dimension.full]}
                      />
                    </View>
                    <View style={[flex.flex1, flex.flexCol, gap.xsmall]}>
                      <Text
                        className="font-medium"
                        style={[
                          font.size[20],
                          textColor(COLOR.text.neutral.med),
                        ]}>
                        Report to be resolved
                      </Text>
                      <ReportCard
                        isReporterCampaignOwner={isReporterCampaignOwner}
                        reportedUser={reportedUser}
                        reporterUser={reporterUser}
                        report={report}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      background(COLOR.background.neutral.default),
                      padding.top.medium,
                      padding.bottom.xsmall,
                    ]}>
                    <FormFieldHelper
                      title="Describe your reason"
                      titleSize={30}
                    />
                  </View>
                  <View style={[padding.bottom.medium]}>
                    <FormlessCustomTextInput
                      type="textarea"
                      rules={{
                        required: 'Reason for the action taken is required',
                      }}
                      counter
                      description="Min. 30 character, Max. 500 character"
                      placeholder="Describe your reason here"
                      max={500}
                      onChange={setActionTakenReason}
                    />
                  </View>
                  {selectedActionTaken === ActionTaken.warningIssued && (
                    <FormFieldHelper
                      title="Warning Notes"
                      description="Reported user will see the notes when they open the app"
                      titleSize={30}
                    />
                  )}
                  {selectedActionTaken === ActionTaken.warningIssued && (
                    <FormlessCustomTextInput
                      type="textarea"
                      rules={{
                        required: 'Reason for the action taken is required',
                      }}
                      counter
                      description="Min. 30 character, Max. 500 character"
                      placeholder="Describe your reason here"
                      max={500}
                      onChange={setWarningNotes}
                    />
                  )}
                </BottomSheetScrollView>
              </View>
              <View style={[padding.horizontal.default]}>
                <CustomButton
                  text="Submit"
                  disabled={
                    actionTakenReason.length < 30 ||
                    (selectedActionTaken === ActionTaken.warningIssued &&
                      warningNotes.length < 30)
                  }
                  onPress={resolveReport}
                />
              </View>
            </View>
          </PagerView>
        </BottomSheetModalWithTitle>
      </SheetModal>
    </>
  );
};

interface ReportDetailSectionProps {
  isReporterCampaignOwner: boolean;
  reportedUser: User;
  reporterUser: User;
  report: Report;
}

const ReportDetailSection = ({...props}: ReportDetailSectionProps) => {
  const navigation = useNavigation<NavigationStackProps>();
  return (
    <>
      <Seperator />
      <View style={[padding.default, flex.flexCol, gap.default]}>
        <View style={[flex.flexRow, justify.between]}>
          <Text
            className="font-bold"
            style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
            Report Detail
          </Text>
          {props.report?.transactionId && (
            <InternalLink
              text="View Transaction Detail"
              size={30}
              scale={0.95}
              onPress={() => {
                navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
                  transactionId: props.report.transactionId!!,
                });
              }}
            />
          )}
        </View>
        <ReportCard {...props} />
      </View>
    </>
  );
};

interface ReportCardProps {
  report: Report;
  reporterUser: User;
  reportedUser: User;
  isReporterCampaignOwner: boolean;
}

const ReportCard = ({...props}: ReportCardProps) => {
  return (
    <View
      style={[
        flex.flexCol,
        gap.default,
        props.report.actionTaken && [
          padding.default,
          rounded.default,
          background(COLOR.black[5]),
        ],
      ]}>
      <View
        style={[
          flex.flexCol,
          padding.default,
          rounded.default,
          gap.default,
          background(COLOR.black[5]),
          props.report.actionTaken && [
            rounded.small,
            background(COLOR.black[10]),
            {
              borderLeftWidth: 5,
              borderColor: COLOR.black[25],
            },
          ],
        ]}>
        <View style={[flex.flexCol, gap.xsmall]}>
          <Text
            className="font-semibold"
            style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
            {props.report.type}
          </Text>
          {props.report?.reason && (
            <Text
              className=""
              style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
              {props.report.reason}
            </Text>
          )}
        </View>
        <View style={[flex.flexCol, gap.xsmall2]}>
          <Text style={[font.size[10], textColor(COLOR.text.neutral.med)]}>
            {formatDateToDayMonthYearHourMinute(
              new Date(props.report.createdAt!!),
            )}
          </Text>
          <Text style={[font.size[10], textColor(COLOR.text.neutral.med)]}>
            <Text className="font-semibold">
              {props.isReporterCampaignOwner
                ? props.reporterUser?.businessPeople?.fullname
                : props.reporterUser?.contentCreator?.fullname}
            </Text>{' '}
            reported{' '}
            <Text className="font-semibold">
              {props.isReporterCampaignOwner
                ? props.reportedUser?.contentCreator?.fullname
                : props.reportedUser?.businessPeople?.fullname}
            </Text>
          </Text>
        </View>
      </View>
      {props.report?.actionTaken && (
        <View style={[flex.flexCol, gap.xsmall]}>
          <Text
            className="font-semibold"
            style={[font.size[30], textColor(COLOR.text.danger.default)]}>
            {props.report.actionTaken}
          </Text>
          <Text
            className="font-medium"
            style={[font.size[20], textColor(COLOR.text.danger.default)]}>
            {props.report.actionTakenReason}
          </Text>
          {props.report.updatedAt && (
            <Text style={[font.size[10], textColor(COLOR.text.danger.default)]}>
              {formatDateToDayMonthYearHourMinute(
                new Date(props.report.updatedAt!!),
              )}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ReportDetailScreen;

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
