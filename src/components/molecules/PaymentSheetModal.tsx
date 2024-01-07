import {Text, View} from 'react-native';
import {SheetModal} from '../../containers/SheetModal';
import {flex, items, justify, self} from '../../styles/Flex';
import {gap} from '../../styles/Gap';
import {padding} from '../../styles/Padding';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {COLOR} from '../../styles/Color';
import {CustomButton} from '../atoms/Button';
import {formatToRupiah} from '../../utils/currency';
import {MediaUploader} from '../atoms/Input';
import {useEffect, useMemo, useState} from 'react';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import FastImage from 'react-native-fast-image';
import PhotosIcon from '../../assets/vectors/photos.svg';
import ImageView from 'react-native-image-viewing';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useUser} from '../../hooks/user';
import {BankAccountInformation, UserRole} from '../../model/User';
import {
  PaymentStatus,
  Transaction,
  TransactionStatus,
  paymentStatusTypeMap,
} from '../../model/Transaction';
import StatusTag, {StatusType} from '../atoms/StatusTag';
import {border} from '../../styles/Border';
import {background} from '../../styles/BackgroundColor';
import {Campaign, CampaignStep} from '../../model/Campaign';
import {formatDateToDayMonthYear, getDate} from '../../utils/date';
import {CustomAlert} from './CustomAlert';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';

type Props = {
  isModalOpened: boolean;
  onModalDismiss: () => void;
  onProofUploaded: (url: string) => void;
  onProofAccepted?: () => void;
  onProofRejected?: () => void;
  onWithdrawalAccepted?: () => void;
  withdrawerBankAccount?: BankAccountInformation;
  transaction: Transaction;
  campaign?: Campaign | null;
};

const PaymentSheetModal = ({
  isModalOpened,
  onModalDismiss,
  onProofUploaded,
  onProofAccepted = undefined,
  onProofRejected = undefined,
  onWithdrawalAccepted = undefined,
  withdrawerBankAccount = undefined,
  transaction,
  campaign,
}: Props) => {
  const {isBusinessPeople, isAdmin, user} = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | undefined>();
  const [isImageViewOpened, setIsImageViewOpened] = useState(false);
  const navigation = useNavigation<NavigationStackProps>();
  const amount = useMemo(
    () => transaction.transactionAmount || campaign?.fee || -1,
    [transaction, campaign],
  );
  const defaultImage = useMemo(
    () => transaction.payment?.proofImage,
    [transaction],
  );
  const paymentStatus = useMemo(
    () => transaction.payment?.status,
    [transaction],
  );
  const campaignRegistrationEndDate = useMemo(
    () =>
      formatDateToDayMonthYear(
        getDate(
          campaign.timeline.find(t => t.step === CampaignStep.Registration)
            ?.end || 0,
        ),
      ),
    [campaign],
  );

  const onRequestWithdraw = () => {
    transaction
      ?.update({
        payment: {
          ...transaction.payment,
          status: PaymentStatus.withdrawalRequested,
        },
      })
      .then(() => {
        showToast({
          message:
            'Withdrawal Requested! You will receive your money in no later than 7 x 24 hours.',
          type: ToastType.success,
        });
      });
  };
  useEffect(() => {
    if (defaultImage) {
      setUploadedImage(defaultImage);
    }
  }, [defaultImage]);

  // TODO: kalo reupload, apus yang lama
  return (
    <>
      <SheetModal open={isModalOpened} onDismiss={onModalDismiss}>
        <View
          style={[
            flex.flexCol,
            gap.default,
            padding.top.default,
            padding.bottom.xlarge,
            padding.horizontal.medium,
          ]}>
          <View style={[flex.flexCol, gap.default]}>
            <View style={[flex.flexRow, items.center, justify.between]}>
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                Payment Proof
              </Text>
              <StatusTag
                status={paymentStatus || 'Not Uploaded'}
                statusType={
                  paymentStatus
                    ? paymentStatusTypeMap[paymentStatus]
                    : StatusType.terminated
                }
              />
            </View>
            <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
              {/* TODO: taro bank account admin */}
              {isBusinessPeople && (
                <>
                  {transaction.status ===
                    TransactionStatus.registrationPending &&
                    `You need to pay ${formatToRupiah(
                      amount,
                    )} to Account Number xxxxxxxxxx [admin bank account] by ${campaignRegistrationEndDate}. Upload your payment proof here.`}
                  {transaction.status === TransactionStatus.terminated &&
                    paymentStatus === PaymentStatus.proofApproved &&
                    `This transaction has been terminated. You can request a withdrawal, and your money will be processed within 7 x 24 hours.`}
                </>
              )}

              {isAdmin && (
                <>
                  {paymentStatus ===
                    PaymentStatus.proofWaitingForVerification &&
                    `Business People have paid ${formatToRupiah(
                      amount,
                    )}, please verify the payment.`}
                  {paymentStatus === PaymentStatus.withdrawalRequested &&
                    `${
                      transaction.isTerminated()
                        ? 'Business People'
                        : 'Content Creator'
                    } have requested to withdraw their money, you need to pay ${formatToRupiah(
                      amount,
                    )} to the following bank account: ${
                      withdrawerBankAccount?.bankName
                    } - ${withdrawerBankAccount?.accountNumber} (${
                      withdrawerBankAccount?.accountHolderName
                    })`}
                </>
              )}
            </Text>
          </View>

          <View style={[flex.flexCol, items.center]}>
            {uploadedImage && (
              <TouchableOpacity onPress={() => setIsImageViewOpened(true)}>
                <View
                  className="overflow-hidden"
                  style={[dimension.square.xlarge15, rounded.medium]}>
                  <FastImage
                    style={[dimension.full]}
                    source={{uri: uploadedImage}}
                  />
                </View>
              </TouchableOpacity>
            )}
            {isBusinessPeople &&
            (paymentStatus === PaymentStatus.proofWaitingForVerification ||
              paymentStatus === PaymentStatus.proofRejected ||
              paymentStatus === undefined) &&
            transaction.status === TransactionStatus.registrationPending ? (
              <View style={[dimension.square.xlarge12]}>
                <MediaUploader
                  targetFolder="payment"
                  showUploadProgress
                  options={{
                    //   width: 400,
                    //   height: 400,
                    compressImageQuality: 0.5,
                    //   cropping: true,
                  }}
                  onUploadSuccess={url => {
                    setUploadedImage(url);
                    onProofUploaded(url);
                  }}
                  onMediaSelected={imageOrVideo => console.log(imageOrVideo)}>
                  {uploadedImage ? (
                    <Text
                      style={[
                        self.center,
                        padding.top.default,
                        textColor(COLOR.text.green.default),
                        font.size[30],
                      ]}>
                      Reupload
                    </Text>
                  ) : (
                    <View
                      style={[
                        flex.flex1,
                        rounded.medium,
                        flex.flexRow,
                        justify.center,
                        items.center,
                        {
                          borderStyle: 'dashed',
                        },
                        border({
                          borderWidth: 1,
                          color: COLOR.black[20],
                        }),
                        background(COLOR.black[5]),
                      ]}>
                      <PhotosIcon
                        width={30}
                        height={30}
                        color={COLOR.text.neutral.high}
                      />
                    </View>
                  )}
                </MediaUploader>
              </View>
            ) : (
              <View style={[flex.flexRow, gap.default, padding.top.default]}>
                {paymentStatus ===
                  PaymentStatus.proofWaitingForVerification && (
                  <>
                    <View style={[flex.flex1]}>
                      <CustomButton
                        text="Reject"
                        type="tertiary"
                        customTextColor={COLOR.text.danger}
                        scale={1}
                        onPress={onProofRejected}
                        customTextSize={20}
                      />
                    </View>
                    {/* {paymentStatus === */}
                    {/* PaymentStatus.proofWaitingForVerification && ( */}
                    <View style={[flex.flex1]}>
                      <CustomButton
                        text="Accept"
                        scale={1}
                        onPress={onProofAccepted}
                        customTextSize={20}
                      />
                    </View>
                    {/* )} */}
                  </>
                )}
                {paymentStatus === PaymentStatus.withdrawalRequested &&
                  isAdmin && (
                    <View style={[flex.flex1]}>
                      <CustomButton
                        text="I Have Paid This User"
                        scale={1}
                        onPress={onWithdrawalAccepted}
                        customTextSize={20}
                      />
                    </View>
                  )}
              </View>
            )}

            {isBusinessPeople &&
              transaction.status === TransactionStatus.terminated &&
              paymentStatus === PaymentStatus.proofApproved && (
                <View style={[flex.flexRow]}>
                  <View style={[flex.flex1]}>
                    <CustomAlert
                      text="Withdraw"
                      rejectButtonText="Cancel"
                      approveButtonText="OK"
                      confirmationText={
                        <Text
                          className="text-center"
                          style={[
                            font.size[30],
                            textColor(COLOR.text.neutral.med),
                          ]}>
                          {user?.bankAccountInformation
                            ? `You are about to request money withdrawal from Admin, and the money will be sent to the following bank account: ${user?.bankAccountInformation?.bankName} - ${user?.bankAccountInformation?.accountNumber} (${user?.bankAccountInformation?.accountHolderName}). Do you wish to continue?`
                            : 'You have not set your payment information yet, do you want to set it now?'}
                        </Text>
                      }
                      onApprove={
                        user?.bankAccountInformation
                          ? onRequestWithdraw
                          : () =>
                              navigation.navigate(
                                AuthenticatedNavigation.EditBankAccountInformation,
                              )
                      }
                    />
                  </View>
                </View>
              )}
          </View>
        </View>
      </SheetModal>
      {uploadedImage && (
        <ImageView
          images={[
            {
              uri: uploadedImage,
            },
          ]}
          imageIndex={0}
          visible={isImageViewOpened}
          onRequestClose={() => setIsImageViewOpened(false)}
          swipeToCloseEnabled
          backgroundColor="white"
        />
      )}
    </>
  );
};

export default PaymentSheetModal;
