import {ReactNode, useEffect, useState} from 'react';
import {LoadingScreen} from '../LoadingScreen';
import {Transaction} from '../../model/Transaction';
import {useUser} from '../../hooks/user';
import {UserRole} from '../../model/User';
import {Pressable, View, useWindowDimensions} from 'react-native';
import {flex, items, justify, self} from '../../styles/Flex';
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
import {InternalLink} from '../../components/atoms/Link';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';

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
      <View style={[flex.flex1, background(COLOR.background.neutral.default)]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[flex.flex1]}
          contentContainerStyle={[
            {
              paddingTop: Math.max(safeAreaInsets.top, size.default),
            },
            padding.bottom.large,
            flex.flexCol,
            gap.default,
          ]}>
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
          <View
            style={[
              flex.flex1,
              flex.flexCol,
              gap.default,
              padding.horizontal.default,
            ]}>
            {transactions.map(transaction => (
              <CampaignCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        </ScrollView>
      </View>
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
  const navigation = useNavigation<NavigationStackProps>();
  return (
    <View style={[padding.horizontal.default]}>
      <View
        style={[
          padding.horizontal.small,
          padding.vertical.default,
          rounded.medium,
          flex.flexRow,
          justify.around,
          shadow.default,
        ]}>
        <DashboardPanelItem
          label={
            user?.bankAccountInformation
              ? user?.bankAccountInformation?.bankName
              : 'Bank Account'
          }>
          {user?.bankAccountInformation ? (
            <Pressable
              style={[
                flex.flexCol,
                justify.center,
                {
                  maxWidth: size.xlarge9,
                },
              ]}
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditBankAccountInformationScreen,
                );
              }}>
              <Text
                className="font-semibold text-center"
                style={[
                  self.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.med),
                ]}
                numberOfLines={1}>
                {`${user?.bankAccountInformation?.accountNumber}`}
              </Text>
              <Text
                className="font-semibold text-center"
                style={[
                  self.center,
                  font.size[20],
                  textColor(COLOR.text.neutral.med),
                ]}
                numberOfLines={1}>
                {`${user?.bankAccountInformation?.accountHolderName}`}
              </Text>
            </Pressable>
          ) : (
            <InternalLink
              text="Update Bank Info"
              size={30}
              onPress={() => {
                navigation.navigate(
                  AuthenticatedNavigation.EditBankAccountInformationScreen,
                );
              }}
            />
          )}
        </DashboardPanelItem>

        <DashboardPanelItem label="Rating">
          <View style={[flex.flexRow, items.end, gap.xsmall2]}>
            <RatingStarIcon size="medium" />
            <Text
              className="font-bold"
              style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
              {/* {Math.round(user?.contentCreator?.rating || 4.88).toFixed(1)} */}
              {round(user?.contentCreator?.rating || 0, 1).toFixed(1)}
            </Text>
          </View>
        </DashboardPanelItem>
      </View>
    </View>
  );
};

interface DashboardPanelItemProps {
  children?: ReactNode;
  label: string;
}

const DashboardPanelItem = ({...props}: DashboardPanelItemProps) => {
  return (
    <View style={[flex.flexCol, items.center, gap.small]}>
      <View
        style={[
          flex.flexCol,
          justify.center,
          {
            height: size.xlarge2,
          },
        ]}>
        {props.children}
      </View>
      <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
        {props.label}
      </Text>
    </View>
  );
};

export default DashboardScreen;
