import {useEffect, useState} from 'react';
import {LoadingScreen} from '../LoadingScreen';
import {Transaction} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import {UserRole} from '../../model/User';
import {View, useWindowDimensions} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {padding} from '../../styles/Padding';
import {rounded} from '../../styles/BorderRadius';
import {shadow} from '../../styles/Shadow';
import {Text} from 'react-native';
import {font} from '../../styles/Font';
import {textColor} from '../../styles/Text';
import {COLOR} from '../../styles/Color';
import {gap} from '../../styles/Gap';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SafeAreaContainer from '../../containers/SafeAreaContainer';
import {RatingStarIcon} from '../../components/atoms/Icon';
import {round} from 'lodash';
import {ScrollView} from 'react-native-gesture-handler';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {size} from '../../styles/Size';
import {OngoingCampaignCard} from '../../components/molecules/OngoingCampaignCard';
import {SkeletonPlaceholder} from '../../components/molecules/SkeletonPlaceholder';
import {Campaign} from '../../model/Campaign';

const DashboardScreen = () => {
  const safeAreaInsets = useSafeAreaInsets();
  const {uid, user} = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (uid) {
      return Transaction.getAllTransactionsByRole(
        uid,
        UserRole.ContentCreator,
        setTransactions,
      );
    }
  }, [uid]);

  if (!transactions || !user) {
    return <LoadingScreen />;
  }
  return (
    <>
      {isLoading && <LoadingScreen />}
      <SafeAreaContainer enable>
        <ScrollView
          style={[flex.flex1]}
          contentContainerStyle={[flex.flexCol, gap.default]}>
          <DashboardPanel />
          <ScrollView
            horizontal
            contentContainerStyle={[
              flex.flexRow,
              gap.default,
              padding.horizontal.default,
              padding.vertical.small,
            ]}>
            <View
              style={[
                flex.flex1,
                rounded.default,
                {
                  maxHeight: size.xlarge6,
                },
                dimension.width.xlarge8,
                shadow.small,
                padding.default,
                flex.flexCol,
                gap.default,
              ]}>
              <View
                style={[flex.flex1, flex.flexCol, justify.end, gap.xsmall2]}>
                <Text className="font-medium" style={[font.size[20]]}>
                  1 registration
                </Text>
              </View>
              <View>
                <Text
                  className="font-bold"
                  style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                  Ongoing Transactions
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={[flex.flexCol, gap.default, padding.horizontal.default]}>
            {transactions.map(transaction => (
              <CampaignCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaContainer>
    </>
  );
};

interface CampaignCardProps {
  transaction: Transaction;
}

const CampaignCard = ({...props}: CampaignCardProps) => {
  const windowDimension = useWindowDimensions();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  useEffect(() => {
    if (props.transaction.campaignId) {
      Campaign.getById(props.transaction.campaignId)
        .then(setCampaign)
        .catch(() => {
          setCampaign(null);
        });
    }
  }, [props.transaction]);
  return (
    <SkeletonPlaceholder
      isLoading={!campaign}
      width={windowDimension.width - 2 * size.default}
      height={150}>
      {campaign && <OngoingCampaignCard campaign={campaign} />}
    </SkeletonPlaceholder>
  );
};

const DashboardPanel = () => {
  const {user} = useUser();
  return (
    <View style={[padding.horizontal.default]}>
      <View
        style={[
          padding.medium,
          rounded.medium,
          flex.flexRow,
          justify.around,
          shadow.default,
        ]}>
        <View style={[flex.flexCol, items.center, gap.xsmall]}>
          <Text
            className="font-bold"
            style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
            {user?.contentCreator?.specializedCategoryIds[0]}
          </Text>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            Specialized Category
          </Text>
        </View>
        <View style={[flex.flexCol, items.center, gap.xsmall]}>
          <View style={[flex.flexRow, items.end, gap.xsmall2]}>
            <RatingStarIcon size="medium" />
            <Text
              className="font-bold"
              style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
              {/* {Math.round(user?.contentCreator?.rating || 4.88).toFixed(1)} */}
              {round(user?.contentCreator?.rating || 0, 1).toFixed(1)}
            </Text>
          </View>
          <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
            Rating
          </Text>
        </View>
      </View>
    </View>
  );
};

export default DashboardScreen;
