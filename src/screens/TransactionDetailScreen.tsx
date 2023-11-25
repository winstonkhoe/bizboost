import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
  AuthenticatedStack,
} from '../navigation/StackNavigation';
import {Pressable, StyleSheet, Text} from 'react-native';
import {View} from 'react-native';
import TagCard from '../components/atoms/TagCard';
import {Campaign} from '../model/Campaign';
import {
  formatDateToDayMonthYear,
  formatDateToDayMonthYearHourMinute,
} from '../utils/date';
import {CustomButton} from '../components/atoms/Button';
import {useUser} from '../hooks/user';
import {
  Transaction,
  TransactionStatus,
  transactionStatusTypeMap,
} from '../model/Transaction';
import {PageWithBackButton} from '../components/templates/PageWithBackButton';

import People from '../assets/vectors/people.svg';
import ChevronRight from '../assets/vectors/chevron-right.svg';
import {COLOR} from '../styles/Color';
import {gap} from '../styles/Gap';
import {useNavigation} from '@react-navigation/native';
import CampaignPlatformAccordion from '../components/molecules/CampaignPlatformAccordion';
import {User} from '../model/User';
import {flex, items, justify} from '../styles/Flex';
import {horizontalPadding, padding, verticalPadding} from '../styles/Padding';
import {rounded} from '../styles/BorderRadius';
import {border} from '../styles/Border';
import {textColor} from '../styles/Text';
import {formatToRupiah} from '../utils/currency';
import {LoadingScreen} from './LoadingScreen';
import FastImage from 'react-native-fast-image';
import {font} from '../styles/Font';
import {background} from '../styles/BackgroundColor';
import {dimension} from '../styles/Dimension';
import {OngoingCampaignCard} from '../components/molecules/OngoingCampaignCard';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../styles/Size';
import StatusTag from '../components/atoms/StatusTag';
import {ScrollView} from 'react-native-gesture-handler';
import {Label} from '../components/atoms/Label';
type Props = NativeStackScreenProps<
  AuthenticatedStack,
  AuthenticatedNavigation.TransactionDetail
>;

const TransactionDetailScreen = ({route}: Props) => {
  const {uid} = useUser();
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationStackProps>();
  const {transactionId} = route.params;
  const [campaign, setCampaign] = useState<Campaign>();
  const [transaction, setTransaction] = useState<Transaction>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(false);
  const isCampaignOwner = useMemo(() => {
    return campaign?.userId === uid;
  }, [campaign, uid]);

  useEffect(() => {
    Transaction.getById(transactionId).then(setTransaction);
  }, [transactionId]);

  useEffect(() => {
    if (transaction?.campaignId) {
      Campaign.getById(transaction.campaignId).then(setCampaign);
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction?.contentCreatorId) {
      User.getById(transaction?.contentCreatorId).then(setContentCreator);
    }
  }, [transaction]);

  if (!transaction || !campaign) {
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
          <Text
            className="font-bold"
            style={[font.size[50], textColor(COLOR.text.neutral.high)]}>
            Transaction Detail
          </Text>
        }>
        <ScrollView
          style={[flex.flex1]}
          contentContainerStyle={[
            flex.flexCol,
            padding.top.xlarge6,
            gap.default,
          ]}>
          <View style={[padding.default, flex.flexCol, gap.default]}>
            {transaction.status && (
              <View style={[flex.flexRow, justify.between, items.center]}>
                <Text
                  style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                  Status
                </Text>
                <StatusTag
                  fontSize={20}
                  status={transaction.status}
                  statusType={transactionStatusTypeMap[transaction.status]}
                />
              </View>
            )}
            {/* <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
              {transaction.status}
            </Text> */}
            {transaction.createdAt && (
              <>
                <View style={[styles.bottomBorder]} />
                <View style={[flex.flexRow, justify.between, items.center]}>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.med)]}>
                    Transaction Date
                  </Text>
                  <Text
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
                    {formatDateToDayMonthYearHourMinute(
                      new Date(transaction.createdAt),
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
          <Seperator />
          <View style={[flex.flexCol, padding.default, gap.default]}>
            <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
              Campaign Detail
            </Text>
            <View
              style={[
                flex.flexCol,
                padding.default,
                rounded.default,
                border({
                  borderWidth: 1,
                  color: COLOR.black[10],
                }),
              ]}>
              <View style={[flex.flexRow, gap.small]}>
                <View
                  className="overflow-hidden"
                  style={[dimension.square.xlarge3, rounded.default]}>
                  <FastImage
                    source={{uri: campaign.image}}
                    style={[dimension.full]}
                  />
                </View>
                <Text
                  className="font-medium"
                  style={[font.size[30], textColor(COLOR.text.neutral.high)]}
                  numberOfLines={2}>
                  {campaign.title}
                </Text>
              </View>
            </View>
          </View>
          <Seperator />
          <View style={[flex.flexCol, padding.default, gap.default]}>
            <Text
              className="font-bold"
              style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
              Content Creator Detail
            </Text>
            <View
              style={[
                flex.flexCol,
                padding.default,
                rounded.default,
                border({
                  borderWidth: 1,
                  color: COLOR.black[10],
                }),
              ]}>
              <View style={[flex.flexRow, gap.small]}>
                <View
                  className="overflow-hidden"
                  style={[dimension.square.xlarge3, rounded.default]}>
                  <FastImage
                    source={{
                      uri: contentCreator?.contentCreator?.profilePicture,
                    }}
                    style={[dimension.full]}
                  />
                </View>
                <View style={[flex.flexCol]}>
                  <Text
                    className="font-medium"
                    style={[font.size[30], textColor(COLOR.text.neutral.high)]}
                    numberOfLines={2}>
                    {contentCreator?.contentCreator?.fullname}
                  </Text>
                  {contentCreator?.instagram && (
                    <Label text={`@${contentCreator?.instagram?.username}`} />
                  )}
                  {contentCreator?.tiktok && (
                    <Label text={`@${contentCreator?.tiktok?.username}`} />
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
        <View
          style={[
            flex.flexRow,
            gap.default,
            padding.horizontal.medium,
            {
              paddingBottom: Math.max(safeAreaInsets.bottom, size.medium),
            },
          ]}>
          <View style={[flex.flex1]}>
            <CustomButton
              text="Reject"
              type="tertiary"
              customTextColor={{
                default: COLOR.text.danger.default,
                disabled: COLOR.red[10],
              }}
            />
          </View>
          <View style={[flex.flex1]}>
            <CustomButton text="Accept" />
          </View>
        </View>
      </PageWithBackButton>
    </>
  );
};

export default TransactionDetailScreen;

const Seperator = () => {
  return (
    <View
      style={[
        background(COLOR.background.neutral.med),
        dimension.height.default,
      ]}
    />
  );
};

const ContentCreatorPage = () => {};

const BusinessPeoplePage = () => {};

const styles = StyleSheet.create({
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLOR.black[10],
  },
});
