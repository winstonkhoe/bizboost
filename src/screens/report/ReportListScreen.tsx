import {useEffect, useState} from 'react';
import {useUser} from '../../hooks/user';
import {User, UserRole} from '../../model/User';
import {Report, reportStatusTypeMap} from '../../model/Report';
import {PageWithBackButton} from '../../components/templates/PageWithBackButton';
import {StyleSheet, View} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {shadow} from '../../styles/Shadow';
import {Text} from 'react-native';
import {font, lineHeight} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {padding} from '../../styles/Padding';
import {gap} from '../../styles/Gap';
import {ReportIcon} from '../../components/atoms/Icon';
import {fetchReport} from '../../helpers/report';
import {rounded} from '../../styles/BorderRadius';
import StatusTag from '../../components/atoms/StatusTag';
import {Transaction, transactionStatusTypeMap} from '../../model/Transaction';
import {Campaign} from '../../model/Campaign';
import {showToast} from '../../helpers/toast';
import {SkeletonPlaceholder} from '../../components/molecules/SkeletonPlaceholder';
import FastImage from 'react-native-fast-image';
import {dimension} from '../../styles/Dimension';
import {formatDateToDayMonthYear} from '../../utils/date';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {background} from '../../styles/BackgroundColor';
import {AnimatedPressable} from '../../components/atoms/AnimatedPressable';

const ReportListScreen = () => {
  const {uid, activeRole} = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const isAdmin = UserRole.Admin === activeRole;
  useEffect(() => {
    return fetchReport({
      isAdmin: isAdmin,
      uid: uid,
      onComplete: setReports,
    });
  }, [isAdmin, uid]);
  return (
    <PageWithBackButton>
      {reports.map(report => (
        <ReportCard report={report} />
      ))}
    </PageWithBackButton>
  );
};

interface ReportCardProps {
  report: Report;
}

export const ReportCard = ({report}: ReportCardProps) => {
  const [reporterUser, setReporterUser] = useState<User | null>();
  const [reportedUser, setReportedUser] = useState<User | null>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [transaction, setTransaction] = useState<Transaction | null>();
  const isLoading = !transaction || !campaign || !reporterUser || !reportedUser;
  const isReporterCampaignOwner = report?.reporterId === campaign?.userId;

  useEffect(() => {
    if (report?.transactionId) {
      return Transaction.getById(report.transactionId, setTransaction);
    }
  }, [report]);

  useEffect(() => {
    if (transaction?.campaignId) {
      Campaign.getById(transaction?.campaignId)
        .then(setCampaign)
        .catch(() => {
          setCampaign(null);
        });
    }
  }, [transaction]);

  useEffect(() => {
    if (report.reporterId) {
      User.getById(report.reporterId)
        .then(setReporterUser)
        .catch(() => {
          setReporterUser(null);
        });
    }
    if (report.reportedId) {
      User.getById(report.reportedId)
        .then(setReportedUser)
        .catch(() => {
          setReportedUser(null);
        });
    }
  }, [report]);

  return (
    <AnimatedPressable
      scale={0.95}
      style={[flex.flexCol, shadow.small, rounded.default]}
      onPress={() => {}}>
      <View style={[flex.flexRow, items.center, padding.default]}>
        <SkeletonPlaceholder style={[flex.flex1]} isLoading={isLoading}>
          <View style={[flex.flexRow, gap.small, items.center]}>
            <ReportIcon size="large" />
            <View style={[flex.flex1, flex.flexCol]}>
              <Text
                className="font-bold"
                style={[font.size[20], textColor(COLOR.text.neutral.high)]}>
                {report.type}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  flex.flex1,
                  font.size[10],
                  textColor(COLOR.text.neutral.med),
                ]}>
                {`${formatDateToDayMonthYear(
                  new Date(report.createdAt!!),
                )} · Reported by ${
                  isReporterCampaignOwner
                    ? reporterUser?.businessPeople?.fullname
                    : reporterUser?.contentCreator?.fullname
                }`}
              </Text>
            </View>
          </View>
        </SkeletonPlaceholder>
        <SkeletonPlaceholder isLoading={isLoading}>
          <StatusTag
            status={report.status}
            statusType={reportStatusTypeMap[report.status]}
          />
        </SkeletonPlaceholder>
      </View>
      <View style={[padding.horizontal.default]}>
        <View style={[styles.bottomBorder]} />
      </View>
      <View style={[flex.flexRow, padding.default, gap.small]}>
        <SkeletonPlaceholder isLoading={isLoading}>
          <View
            className="overflow-hidden"
            style={[dimension.square.xlarge2, rounded.small]}>
            <FastImage
              style={[dimension.full]}
              source={getSourceOrDefaultAvatar({
                uri: isReporterCampaignOwner
                  ? reportedUser?.contentCreator?.profilePicture
                  : reportedUser?.businessPeople?.profilePicture,
              })}
            />
          </View>
        </SkeletonPlaceholder>
        <View style={[flex.flexCol, flex.flex1, gap.small]}>
          <SkeletonPlaceholder
            isLoading={isLoading}
            height={lineHeight[20] * 1}>
            <View style={[flex.flexRow, items.center, gap.default]}>
              <Text
                className="font-medium"
                numberOfLines={1}
                style={[
                  flex.flex1,
                  font.size[20],
                  textColor(COLOR.text.neutral.high),
                ]}>
                {isReporterCampaignOwner
                  ? reportedUser?.contentCreator?.fullname
                  : reportedUser?.businessPeople?.fullname}
              </Text>
            </View>
          </SkeletonPlaceholder>
          {report.reason && (
            <SkeletonPlaceholder
              isLoading={isLoading}
              height={lineHeight[20] * 2}>
              <View
                style={[
                  background(COLOR.red[5]),
                  padding.small,
                  rounded.small,
                ]}>
                <Text
                  className="font-medium"
                  numberOfLines={2}
                  style={[
                    flex.flex1,
                    font.size[10],
                    textColor(COLOR.text.danger.default),
                  ]}>
                  {report.reason}
                </Text>
              </View>
            </SkeletonPlaceholder>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  bottomBorder: {
    borderColor: COLOR.black[10],
    borderBottomWidth: 1,
  },
});

export default ReportListScreen;
