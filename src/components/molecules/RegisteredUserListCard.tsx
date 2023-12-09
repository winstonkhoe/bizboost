import {Pressable, View} from 'react-native';
import {Text} from 'react-native';
import {flex} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {
  BasicStatus,
  PaymentStatus,
  Transaction,
  TransactionStatus,
  transactionStatusTypeMap,
} from '../../model/Transaction';
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
import StatusTag, {StatusType} from '../atoms/StatusTag';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {getTimeAgo} from '../../utils/date';
import {gap} from '../../styles/Gap';
import FastImage, {Source} from 'react-native-fast-image';
import {ImageRequireSource} from 'react-native';
import PaymentSheetModal from './PaymentSheetModal';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {dimension} from '../../styles/Dimension';

type Props = {
  transaction: Transaction;
  role?: UserRole;
};
const BusinessPeopleTransactionsCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    User.getById(transaction.contentCreatorId || '').then(setContentCreator);
  }, [transaction]);

  useEffect(() => {
    Campaign.getById(transaction.campaignId || '').then(setCampaign);
  }, [transaction]);

  const [isPaymentModalOpened, setIsPaymentModalOpened] = useState(false);

  const onProofUploaded = (url: string) => {
    console.log('url: ' + url);
    //TODO: hmm method2 .update() harus disamain deh antar model (campaign sama ini aja beda)
    transaction
      .update({
        payment: {
          proofImage: url,
          status: PaymentStatus.proofWaitingForVerification,
        },
      })
      .then(() => {
        console.log('updated proof!');
        showToast({
          message:
            'Registration Approved! Your payment is being reviewed by our Admin',
          type: ToastType.success,
        });
      });
  };
  return (
    <>
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
        // headerTextTrailing={getTimeAgo(transaction.updatedAt || 0)}
        handleClickBody={() => {
          console.log('open transaction ', transaction.id, ' detail');
          if (transaction.id) {
            navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
              transactionId: transaction.id,
            });
          }
        }}
        imageSource={
          contentCreator?.contentCreator?.profilePicture
            ? {
                uri: contentCreator?.contentCreator?.profilePicture,
              }
            : require('../../assets/images/bizboost-avatar.png')
        }
        bodyText={contentCreator?.contentCreator?.fullname || ''}
        statusText={transaction.status}
        statusType={
          transactionStatusTypeMap[
            transaction.status || TransactionStatus.terminated
          ]
        }
        doesNeedApproval={
          transaction.status === TransactionStatus.registrationPending &&
          transaction.payment === undefined
        }
        handleClickReject={() => {
          transaction
            .updateStatus(TransactionStatus.registrationRejected)
            .then(() => {
              showToast({
                message: 'Registration Rejected!',
                type: ToastType.danger,
              });
            });
        }}
        handleClickAccept={() => {
          console.log(transaction.payment?.proofImage);
          setIsPaymentModalOpened(true); // TODO: abis klik ini, ganti status? (at least dari pov bp, kalo cc biarin Pending aja trs?)
          //TODO: move approval to admin (approve payment first)
          // transaction.approveRegistration();
        }}
      />
      {/* TODO: kalo gaada kondisi isPaymentModalOpened di awal, gatau kenapa ngebug fotonya pake yang lama trs  */}
      {isPaymentModalOpened && (
        <PaymentSheetModal
          isModalOpened={isPaymentModalOpened}
          onModalDismiss={() => setIsPaymentModalOpened(false)}
          amount={campaign?.fee || -1}
          onProofUploaded={onProofUploaded}
          defaultImage={transaction.payment?.proofImage}
          paymentStatus={transaction.payment?.status}
        />
      )}
    </>
  );
};

const ContentCreatorTransactionCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const [campaign, setCampaign] = useState<Campaign>();
  useEffect(() => {
    Campaign.getById(transaction.campaignId || '').then(setCampaign);
  }, [transaction]);

  const [businessPeople, setBusinessPeople] = useState<User | null>();

  useEffect(() => {
    User.getById(transaction.businessPeopleId || '').then(setBusinessPeople);
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
      // headerTextTrailing={getTimeAgo(transaction.updatedAt || 0)}
      handleClickBody={() => {
        if (transaction.id) {
          navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
            transactionId: transaction.id,
          });
        }
      }}
      imageSource={
        campaign?.image
          ? {
              uri: campaign?.image,
            }
          : require('../../assets/images/bizboost-avatar.png')
      }
      bodyText={campaign?.title || ''}
      statusText={transaction.status}
      statusType={
        transactionStatusTypeMap[
          transaction.status || TransactionStatus.terminated
        ]
      }
    />
  );
};

// MARK: kalo mau edit base card dari sini
type BaseCardProps = {
  handleClickHeader?: () => void;
  icon?: ReactNode;
  headerTextLeading: string;
  headerTextTrailing?: string;
  handleClickBody: () => void;
  imageSource: Source | ImageRequireSource;
  imageDimension?: typeof dimension.square.xlarge3;
  bodyText: string;
  bodyContent?: ReactNode;
  statusText?: string;
  statusType?: StatusType;
  doesNeedApproval?: boolean;
  handleClickAccept?: () => void;
  handleClickReject?: () => void;
};
export const BaseCard = ({
  handleClickHeader,
  icon,
  headerTextLeading,
  headerTextTrailing,
  handleClickBody,
  imageSource = require('../../assets/images/bizboost-avatar.png'),
  imageDimension = dimension.square.xlarge3,
  bodyText,
  statusText,
  statusType,
  doesNeedApproval = false,
  handleClickReject,
  handleClickAccept,
  bodyContent,
}: BaseCardProps) => {
  return (
    <View
      className="bg-white flex flex-col pt-3 overflow-hidden border border-gray-200"
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
          <Text
            style={[
              textColor(
                handleClickHeader ? COLOR.green[50] : COLOR.text.neutral.med,
              ),
              font.size[20],
            ]}
            className={headerTextTrailing ? 'w-[60%]' : 'w-11/12'}
            numberOfLines={1}>
            {headerTextLeading}
          </Text>
        </View>
        <Text
          style={[textColor(COLOR.text.neutral.med), font.size[20]]}
          className="max-w-[33%]"
          numberOfLines={1}>
          {headerTextTrailing}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleClickBody}
        className="flex flex-row items-center px-3 py-4 justify-between">
        <View className="flex flex-row items-center">
          <View
            className="mr-2 items-center justify-center overflow-hidden"
            style={[flex.flexRow, rounded.default, imageDimension]}>
            <FastImage
              className="w-full h-full object-cover"
              source={imageSource}
            />
          </View>
          <View
            className="flex flex-col items-start w-3/4"
            style={[gap.xsmall]}>
            <Text className="font-semibold text-base " numberOfLines={1}>
              {bodyText}
            </Text>
            {statusText && (
              <View>
                <StatusTag status={statusText} statusType={statusType} />
              </View>
            )}
            {bodyContent}
          </View>
        </View>
        <ChevronRight fill={COLOR.black[20]} />
      </Pressable>
      {doesNeedApproval && (
        <View style={[flex.flexRow]}>
          <View style={[flex.flex1]}>
            <CustomButton
              text="Reject"
              scale={1}
              onPress={handleClickReject}
              rounded="none"
              customTextSize={20}
              customBackgroundColor={{
                default: COLOR.black[5],
                disabled: COLOR.black[5],
              }}
              customTextColor={{
                default: COLOR.black[90],
                disabled: COLOR.black[25],
              }}
            />
          </View>
          <View style={[flex.flex1]}>
            <CustomButton
              text="Accept"
              scale={1}
              onPress={handleClickAccept}
              rounded="none"
              customTextSize={20}
            />
          </View>
        </View>
      )}
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
