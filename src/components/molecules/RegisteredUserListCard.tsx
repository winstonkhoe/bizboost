import {ImageSourcePropType, Pressable, View} from 'react-native';
import {Text} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {Image} from 'react-native';
import {Transaction, TransactionStatus} from '../../model/Transaction';
import {User, UserRole, UserRoles} from '../../model/User';
import {useEffect, useState} from 'react';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {shadow} from '../../styles/Shadow';
import {Campaign, CampaignType} from '../../model/Campaign';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import ChevronRight from '../../assets/vectors/chevron-right.svg';
import Lock from '../../assets/vectors/lock.svg';
import StatusTag from './StatusTag';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {getTimeAgo} from '../../utils/date';
import {gap} from '../../styles/Gap';

type Props = {
  transaction: Transaction;
  role?: UserRoles;
};
const BusinessPeopleTransactionsCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [contentCreator, setContentCreator] = useState<User>();
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
      isPrivate={campaign?.type === CampaignType.Private}
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

// MARK: kalo mau edit base card dari sini
type BaseCardProps = {
  handleClickHeader: () => void;
  isPrivate: boolean;
  headerTextLeading: string;
  headerTextTrailing: string;
  handleClickBody: () => void;
  imageSource: ImageSourcePropType;
  bodyText: string;
  statusText: string;
  doesNeedApproval: boolean;
  handleClickAccept: () => void;
  handleClickReject: () => void;
};
const BaseCard = ({
  handleClickHeader,
  isPrivate = false,
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
        className="bg-white flex flex-col pt-4 overflow-hidden"
        style={[rounded.medium]}>
        <Pressable
          onPress={handleClickHeader}
          className="flex flex-row justify-between items-center border-b pb-2 px-3 "
          style={[border({color: COLOR.black[20]})]}>
          <View className="flex flex-row items-center" style={[gap.xsmall]}>
            {isPrivate && (
              <Lock width={15} height={15} stroke={COLOR.black[40]} />
            )}
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
              <Image
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
              {/* TODO: @win bisa gak kalo animatednya optional, soalnya disini keknya ga perlu animasi (apa bikin komponen beda lg?) */}
              <CustomButton
                text="Accept"
                onPress={handleClickAccept}
                rounded="none"
                className="w-full"
                customTextSize={font.size[20]}
              />
            </View>
            <View className="w-1/2">
              <CustomButton
                text="Reject"
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
    // TODO: card buat CC
    return <></>;
  }
};

export default RegisteredUserListCard;
