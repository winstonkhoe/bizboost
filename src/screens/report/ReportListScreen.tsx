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
  const [user, setUser] = useState<User | null>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [transaction, setTransaction] = useState<Transaction | null>();
  const isLoading = !transaction || !campaign || !user;
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
        .then(setUser)
        .catch(() => {
          setUser(null);
        });
    }
  }, [report]);

  return (
    <View style={[flex.flexCol, shadow.small, rounded.default]}>
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
                {`${formatDateToDayMonthYear(new Date(report.createdAt!!))} · ${
                  isReporterCampaignOwner
                    ? user?.businessPeople?.fullname
                    : user?.contentCreator?.fullname
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
              source={{uri: campaign?.image}}
            />
          </View>
        </SkeletonPlaceholder>
        <View style={[flex.flexCol, flex.flex1]}>
          <SkeletonPlaceholder
            isLoading={isLoading}
            height={lineHeight[20] * 1}>
            <View style={[flex.flexRow, items.start, gap.default]}>
              <Text
                className="font-medium"
                numberOfLines={1}
                style={[
                  flex.flex1,
                  font.size[20],
                  textColor(COLOR.text.neutral.high),
                ]}>
                {campaign?.title}
              </Text>
              {transaction?.status && (
                <StatusTag
                  statusType={transactionStatusTypeMap[transaction.status]}
                  status={transaction?.status}
                  fontSize={5}
                />
              )}
            </View>
          </SkeletonPlaceholder>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBorder: {
    borderColor: COLOR.black[10],
    borderBottomWidth: 1,
  },
});

export default ReportListScreen;
