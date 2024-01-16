import {Pressable, View} from 'react-native';
import {Text} from 'react-native';
import {flex, items, justify} from '../../styles/Flex';
import {rounded} from '../../styles/BorderRadius';
import {
  Transaction,
  TransactionStatus,
  transactionStatusTypeMap,
} from '../../model/Transaction';
import {User, UserRole} from '../../model/User';
import {ReactNode, useCallback, useEffect, useMemo, useState} from 'react';
import {border} from '../../styles/Border';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {Campaign, CampaignType} from '../../model/Campaign';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import Private from '../../assets/vectors/private.svg';
import Public from '../../assets/vectors/public.svg';
import Business from '../../assets/vectors/business.svg';
import StatusTag, {StatusType} from '../atoms/StatusTag';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {gap} from '../../styles/Gap';
import FastImage, {Source} from 'react-native-fast-image';
import {ImageRequireSource} from 'react-native';
import PaymentSheetModal from './PaymentSheetModal';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {dimension} from '../../styles/Dimension';
import {background} from '../../styles/BackgroundColor';
import {StyleSheet} from 'react-native';
import {padding} from '../../styles/Padding';
import {getSourceOrDefaultAvatar} from '../../utils/asset';
import {SkeletonPlaceholder} from './SkeletonPlaceholder';
import ReviewSheetModal from './ReviewSheetModal';
import {Review} from '../../model/Review';
import {overflow} from '../../styles/Overflow';
import {ChevronRight} from '../atoms/Icon';
import {useUser} from '../../hooks/user';

type Props = {
  transaction: Transaction;
  role?: UserRole;
};
const BusinessPeopleTransactionCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {isBusinessPeople} = useUser();
  const [contentCreator, setContentCreator] = useState<User | null>();
  const [review, setReview] = useState<Review | null>();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>();
  const doesNeedApproval =
    transaction.status === TransactionStatus.registrationPending &&
    transaction.payment === undefined;

  const isWaitingActionOnTransactionDetail =
    transaction.isWaitingBusinessPeopleAction() &&
    !doesNeedApproval &&
    isBusinessPeople;
  const isWithdrawable =
    transaction.isWithdrawable(UserRole.BusinessPeople) && isBusinessPeople;
  console.log('isWithdrawable', isWithdrawable, 'transaction', transaction.id);
  const isReviewable =
    review === null && transaction.isCompleted() && isBusinessPeople;

  const navigateToTransactionDetail = useCallback(() => {
    if (transaction.id) {
      navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
        transactionId: transaction.id,
      });
    }
  }, [navigation, transaction.id]);

  const actionText = useMemo(() => {
    if (isWaitingActionOnTransactionDetail) {
      return 'Review Submission';
    }
    if (TransactionStatus.offerWaitingForPayment === transaction.status) {
      return 'Make Payment';
    }
    if (isWithdrawable) {
      return 'Withdraw';
    }
    if (isReviewable) {
      return 'Review';
    }
    return undefined;
  }, [
    isWaitingActionOnTransactionDetail,
    transaction,
    isWithdrawable,
    isReviewable,
  ]);

  const handleAction = useMemo(() => {
    if (isWaitingActionOnTransactionDetail || isWithdrawable) {
      return navigateToTransactionDetail;
    }
    if (isReviewable) {
      return () => {
        setIsReviewModalOpen(true);
      };
    }
    return undefined;
  }, [
    isWaitingActionOnTransactionDetail,
    isWithdrawable,
    isReviewable,
    navigateToTransactionDetail,
  ]);

  useEffect(() => {
    if (transaction.contentCreatorId) {
      User.getById(transaction.contentCreatorId)
        .then(setContentCreator)
        .catch(() => setContentCreator(null));
    }
    if (transaction.campaignId) {
      Campaign.getById(transaction.campaignId)
        .then(setCampaign)
        .catch(() => setCampaign(null));
    }
  }, [transaction]);

  const [isPaymentModalOpened, setIsPaymentModalOpened] = useState(false);

  useEffect(() => {
    if (transaction.id && transaction.businessPeopleId) {
      return Review.getReviewByTransactionIdAndReviewerId(
        transaction.id,
        transaction.businessPeopleId, //bisa pake uid from useUser juga
        setReview,
      );
    }
  }, [transaction]);

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
        bodyContent={
          isReviewable && (
            <ReviewSheetModal
              isModalOpened={isReviewModalOpen}
              onModalDismiss={() => setIsReviewModalOpen(false)}
              transaction={transaction}
            />
          )
        }
        statusText={transaction.status}
        statusType={
          transactionStatusTypeMap[
            transaction.status || TransactionStatus.terminated
          ]
        }
        doesNeedApproval={doesNeedApproval}
        handleAction={handleAction}
        actionText={actionText}
        handleClickReject={() => {
          transaction
            .rejectRegistration()
            .then(() => {
              showToast({
                message: 'Registration Rejected!',
                type: ToastType.success,
              });
            })
            .catch(() => {
              showToast({
                message: 'Failed to reject registration!',
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
          transaction={transaction}
        />
      )}
    </>
  );
};

const ContentCreatorTransactionCard = ({transaction}: Props) => {
  const navigation = useNavigation<NavigationStackProps>();
  const {isContentCreator} = useUser();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [review, setReview] = useState<Review | null>();
  const [campaign, setCampaign] = useState<Campaign | null>();
  const [businessPeople, setBusinessPeople] = useState<User | null>();
  const isReviewable =
    review === null && transaction.isCompleted() && isContentCreator;
  const isWithdrawable =
    transaction.isWithdrawable(UserRole.ContentCreator) && isContentCreator;
  const [
    isWaitingActionOnCampaignTimeline,
    setIsWaitingActionOnCampaignTimeline,
  ] = useState<boolean>();

  useEffect(() => {
    if (transaction.campaignId) {
      Campaign.getById(transaction.campaignId)
        .then(setCampaign)
        .catch(() => {
          setCampaign(null);
        });
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction) {
      transaction
        .isWaitingContentCreatorAction()
        .then(waitingContentCreatorAction => {
          setIsWaitingActionOnCampaignTimeline(waitingContentCreatorAction);
        })
        .catch(() => setIsWaitingActionOnCampaignTimeline(false));
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction.businessPeopleId) {
      User.getById(transaction.businessPeopleId)
        .then(setBusinessPeople)
        .catch(() => {
          setBusinessPeople(null);
        });
    }
  }, [transaction]);

  useEffect(() => {
    if (transaction.id && transaction.contentCreatorId) {
      return Review.getReviewByTransactionIdAndReviewerId(
        transaction.id,
        transaction.contentCreatorId, //bisa pake uid from useUser juga
        setReview,
      );
    }
  }, [transaction]);

  const navigateToTransactionDetail = useCallback(() => {
    if (transaction.id) {
      navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
        transactionId: transaction.id,
      });
    }
  }, [navigation, transaction.id]);

  const navigateToCampaignTimeline = useCallback(() => {
    if (campaign?.id) {
      navigation.navigate(AuthenticatedNavigation.CampaignTimeline, {
        campaignId: campaign.id,
      });
    }
  }, [navigation, campaign?.id]);

  const actionText = useMemo(() => {
    if (isWaitingActionOnCampaignTimeline) {
      return 'Make Submission';
    }
    if (isWithdrawable) {
      return 'Withdraw';
    }
    if (isReviewable) {
      return 'Review';
    }
    return undefined;
  }, [isWaitingActionOnCampaignTimeline, isWithdrawable, isReviewable]);

  const handleAction = useMemo(() => {
    if (isWaitingActionOnCampaignTimeline) {
      return navigateToCampaignTimeline;
    }
    if (isWithdrawable) {
      return navigateToTransactionDetail;
    }
    if (isReviewable) {
      return () => {
        setIsReviewModalOpen(true);
      };
    }
    return undefined;
  }, [
    isWaitingActionOnCampaignTimeline,
    isWithdrawable,
    isReviewable,
    navigateToCampaignTimeline,
    navigateToTransactionDetail,
  ]);

  return (
    <BaseCard
      handleClickHeader={() => {
        navigation.navigate(AuthenticatedNavigation.BusinessPeopleDetail, {
          businessPeopleId: businessPeople?.id || '',
        });
      }}
      icon={<Business width={15} height={15} stroke={COLOR.green[50]} />}
      headerTextLeading={businessPeople?.businessPeople?.fullname}
      // headerTextTrailing={getTimeAgo(transaction.updatedAt || 0)}
      handleClickBody={() => {
        if (transaction.id) {
          navigation.navigate(AuthenticatedNavigation.TransactionDetail, {
            transactionId: transaction.id,
          });
        }
      }}
      imageSource={getSourceOrDefaultAvatar({
        uri: campaign?.image,
      })}
      // bodyText={campaign?.title}
      bodyText={campaign?.title}
      handleAction={handleAction}
      actionText={actionText}
      bodyContent={
        isReviewable && (
          <ReviewSheetModal
            isModalOpened={isReviewModalOpen}
            onModalDismiss={() => setIsReviewModalOpen(false)}
            transaction={transaction}
          />
        )
      }
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
  headerTextLeading?: string; //essential
  headerTextTrailing?: string | ReactNode;
  handleClickBody: () => void;
  imageSource: Source | ImageRequireSource;
  imageDimension?: typeof dimension.square.xlarge3;
  bodyText?: string; //essential

  // TODO: kalo sempet rapihin bodycontent sama status
  bodyContent?: ReactNode;
  statusText?: string;
  statusType?: StatusType;

  doesNeedApproval?: boolean;
  handleClickAccept?: () => void;
  handleClickReject?: () => void;
  actionText?: string;
  handleAction?: () => void;
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
  actionText = 'Action Needed',
  handleAction,
}: BaseCardProps) => {
  const isLoading = !headerTextLeading || !bodyText;
  return (
    <View
      style={[
        overflow.hidden,
        flex.flexCol,
        rounded.medium,
        background(COLOR.background.neutral.default),
        border({
          borderWidth: 1,
          color: COLOR.black[20],
        }),
      ]}>
      <Pressable
        onPress={handleClickHeader}
        style={[
          padding.top.default,
          padding.horizontal.default,
          {
            paddingBottom: 10,
          },
          flex.flexRow,
          justify.between,
          items.center,
          styles.bottomBorder,
        ]}>
        <SkeletonPlaceholder isLoading={isLoading}>
          <View style={[flex.flexRow, items.center, gap.xsmall]}>
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
                headerTextTrailing
                  ? [
                      {
                        width: '60%',
                      },
                    ]
                  : [
                      {
                        width: '91.67%',
                      },
                    ],
              ]}
              numberOfLines={1}>
              {headerTextLeading}
            </Text>
          </View>
        </SkeletonPlaceholder>
        <SkeletonPlaceholder isLoading={isLoading}>
          {typeof headerTextTrailing === 'string' ? (
            <Text
              style={[textColor(COLOR.text.neutral.med), font.size[20]]}
              numberOfLines={1}>
              {headerTextTrailing}
            </Text>
          ) : (
            headerTextTrailing
          )}
        </SkeletonPlaceholder>
      </Pressable>
      <Pressable
        onPress={handleClickBody}
        style={[flex.flexRow, items.center, justify.between, padding.default]}>
        <View style={[flex.flex1, flex.flexRow, gap.default, items.center]}>
          <SkeletonPlaceholder isLoading={isLoading}>
            <View
              style={[
                flex.flexRow,
                items.center,
                justify.center,
                overflow.hidden,
                rounded.default,
                imageDimension,
              ]}>
              <FastImage style={[dimension.full]} source={imageSource} />
            </View>
          </SkeletonPlaceholder>
          <SkeletonPlaceholder style={[flex.flex1]} isLoading={isLoading}>
            <View style={[flex.flex1, flex.flexCol, gap.xsmall]}>
              <Text
                style={[
                  font.size[30],
                  textColor(COLOR.text.neutral.high),
                  font.weight.semibold,
                ]}
                numberOfLines={1}>
                {bodyText}
              </Text>
              {statusText && (
                <View style={[flex.flexRow, justify.start]}>
                  <StatusTag status={statusText} statusType={statusType} />
                </View>
              )}
              {bodyContent}
            </View>
          </SkeletonPlaceholder>
        </View>
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
      {handleAction && (
        <Pressable
          style={[
            flex.flex1,
            padding.default,
            flex.flexRow,
            gap.small,
            justify.center,
            items.center,
            {
              borderTopColor: COLOR.black[20],
              borderTopWidth: 1,
            },
          ]}
          onPress={handleAction}>
          <Text
            style={[
              font.size[30],
              font.weight.bold,
              textColor(COLOR.green[50]),
            ]}>
            {actionText}
          </Text>
          <ChevronRight
            color={COLOR.green[50]}
            size="medium"
            strokeWidth={1.5}
          />
        </Pressable>
      )}
    </View>
  );
};
// END MARK

const TransactionCard = ({transaction, role}: Props) => {
  if (role === UserRole.BusinessPeople) {
    return <BusinessPeopleTransactionCard transaction={transaction} />;
  } else {
    return <ContentCreatorTransactionCard transaction={transaction} />;
  }
};

export default TransactionCard;

const styles = StyleSheet.create({
  bottomBorder: {
    borderColor: COLOR.black[20],
    borderBottomWidth: 1,
  },
});
