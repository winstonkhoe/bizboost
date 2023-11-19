import {Pressable, View} from 'react-native';
import {Text} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {User, UserRole} from '../../model/User';
import {ReactNode, useEffect, useState} from 'react';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {shadow} from '../../styles/Shadow';
import {Campaign, CampaignType} from '../../model/Campaign';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import Private from '../../assets/vectors/private.svg';
import Public from '../../assets/vectors/public.svg';
import Business from '../../assets/vectors/business.svg';
import StatusTag from '../atoms/StatusTag';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {getTimeAgo} from '../../utils/date';
import {gap} from '../../styles/Gap';
import FastImage, {Source} from 'react-native-fast-image';
import {ImageRequireSource} from 'react-native';

type Props = {
  transaction: Transaction;
  role?: UserRole;
};
const BusinessPeopleTransactionsCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    User.getById(transaction.contentCreatorId || '').then(u =>
      setContentCreator(u),
    );
  }, [transaction]);

  useEffect(() => {
    Campaign.getById(transaction.campaignId || '').then(c => setCampaign(c));
  }, [transaction]);

  return (
    <BaseCard
      handleClickHeader={() => {
        console.log('open campaign detail / BP detail');
        navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
          campaignId: campaign?.id || '',
        });
      }}
      icon={
        campaign?.type === CampaignType.Private ? (
          <Private width={15} height={15} stroke={COLOR.green[50]} />
        ) : (
          <Public width={15} height={15} stroke={COLOR.green[50]} />
        )
      }
      headerTextLeading={campaign?.title || ''}
      headerTextTrailing={getTimeAgo(transaction.updatedAt || 0)}
      handleClickBody={() => {
        console.log('open CC detail / campaign detail');
        // navigation.navigate(AuthenticatedNavigation.)
      }}
      imageSource={
        contentCreator?.contentCreator?.profilePicture
          ? {
              uri: contentCreator?.contentCreator?.profilePicture,
            }
          : require('../../assets/images/bizboost-avatar.png')
      }
      bodyText={contentCreator?.contentCreator?.fullname || ''}
      statusText={transaction.status || ''}
      doesNeedApproval={
        transaction.status === TransactionStatus.registrationPending
      }
      handleClickReject={() => {
        transaction.updateStatus(TransactionStatus.registrationRejected);
      }}
      handleClickAccept={() => {
        transaction.updateStatus(TransactionStatus.registrationApproved);
      }}
    />
  );
};

const ContentCreatorTransactionCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    Campaign.getById(transaction.campaignId || '').then(c => setCampaign(c));
  }, [transaction]);

  const [businessPeople, setBusinessPeople] = useState<User | null>();

  useEffect(() => {
    User.getById(transaction.businessPeopleId || '').then(u =>
      setBusinessPeople(u),
    );
  }, [transaction]);

  return (
    <BaseCard
      handleClickHeader={() => {
        navigation.navigate(AuthenticatedNavigation.BusinessPeopleDetail, {
          businessPeopleId: businessPeople?.id || '',
        });
      }}
      icon={<Business width={15} height={15} stroke={COLOR.green[50]} />}
      headerTextLeading={businessPeople?.businessPeople?.fullname || ''}
      headerTextTrailing={getTimeAgo(transaction.updatedAt || 0)}
      handleClickBody={() => {
        navigation.navigate(AuthenticatedNavigation.CampaignDetail, {
          campaignId: campaign?.id || '',
        });
      }}
      imageSource={
        campaign?.image
          ? {
              uri: campaign?.image,
            }
          : require('../../assets/images/bizboost-avatar.png')
      }
      bodyText={campaign?.title || ''}
      statusText={transaction.status || ''}
    />
  );
};

// MARK: kalo mau edit base card dari sini
type BaseCardProps = {
  handleClickHeader: () => void;
  icon?: ReactNode;
  headerTextLeading: string;
  headerTextTrailing: string;
  handleClickBody: () => void;
  imageSource: Source | ImageRequireSource;
  bodyText: string;
  statusText: string;
  doesNeedApproval?: boolean;
  handleClickAccept?: () => void;
  handleClickReject?: () => void;
};
const BaseCard = ({
  handleClickHeader,
  icon,
  headerTextLeading,
  headerTextTrailing,
  handleClickBody,
  imageSource = require('../../assets/images/bizboost-avatar.png'),
  bodyText,
  statusText,
  doesNeedApproval = false,
  handleClickReject,
  handleClickAccept,
}: BaseCardProps) => {
  return (
    <View style={[shadow.default, rounded.medium]}>
      <View
        className="bg-white flex flex-col pt-3 overflow-hidden"
        style={[rounded.medium]}>
        <Pressable
          onPress={handleClickHeader}
          className="flex flex-row justify-between items-center border-b pb-2 px-3 "
          style={[border({color: COLOR.black[20]})]}>
          <View className="flex flex-row items-center" style={[gap.xsmall]}>
            {icon}
            {/* {isPrivate && (
              <Private width={15} height={15} stroke={COLOR.black[40]} />
            )} */}
            <Text style={[textColor(COLOR.green[50]), font.size[20]]}>
              {headerTextLeading}
            </Text>
          </View>
          <Text style={[textColor(COLOR.black[30]), font.size[20]]}>
            {headerTextTrailing}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleClickBody}
          className="flex flex-row items-center px-3 py-4 justify-between">
          <View className="flex flex-row items-center">
            <View
              className="mr-2 w-14 h-14 items-center justify-center overflow-hidden"
              style={[flex.flexRow, rounded.default]}>
              <FastImage
                className="w-full h-full object-cover"
                source={imageSource}
              />
            </View>
            <View className="flex flex-col items-start w-3/4">
              <Text className="font-semibold text-base " numberOfLines={1}>
                {bodyText}
              </Text>
              <View>
                <StatusTag status={statusText} />
              </View>
            </View>
          </View>
          <ChevronRight fill={COLOR.black[20]} />
        </Pressable>
        {doesNeedApproval && (
          <View className="flex flex-row items-center justify-between w-full">
            <View className="w-1/2">
              <CustomButton
                text="Accept"
                scale={1}
                onPress={handleClickAccept}
                rounded="none"
                className="w-full"
                customTextSize={font.size[20]}
              />
            </View>
            <View className="w-1/2">
              <CustomButton
                text="Reject"
                scale={1}
                onPress={handleClickReject}
                rounded="none"
                className="w-full"
                customTextSize={font.size[20]}
                type="alternate"
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
// END MARK

const RegisteredUserListCard = ({transaction, role}: Props) => {
  if (role === UserRole.BusinessPeople) {
    return <BusinessPeopleTransactionsCard transaction={transaction} />;
  } else {
    return <ContentCreatorTransactionCard transaction={transaction} />;
  }
};

export default RegisteredUserListCard;
