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
import {useEffect, useState} from 'react';
import {dimension} from '../../styles/Dimension';
import {rounded} from '../../styles/BorderRadius';
import FastImage from 'react-native-fast-image';
import PhotosIcon from '../../assets/vectors/photos.svg';
import ImageView from 'react-native-image-viewing';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {useUser} from '../../hooks/user';
import {User} from '../../model/User';
import {
  PaymentStatus,
  Transaction,
  paymentStatusTypeMap,
} from '../../model/Transaction';
import StatusTag, {StatusType} from '../atoms/StatusTag';
import {border} from '../../styles/Border';
import {background} from '../../styles/BackgroundColor';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {overflow} from '../../styles/Overflow';

type Props = {
  isModalOpened: boolean;
  onModalDismiss: () => void;
  transaction: Transaction;
};

const PaymentSheetModal = ({
  isModalOpened,
  onModalDismiss,
  transaction,
}: Props) => {
  const {isBusinessPeople, isAdmin} = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(
    transaction.payment?.proofImage,
  );
  const [contentCreator, setContentCreator] = useState<User | null>();
  const contentCreatorBankAccount = contentCreator?.bankAccountInformation;
  const amount = transaction.transactionAmount || 0; //TODO: cek kalo approve offer negotiate pricenya udh update ke transactionAmountnya blm
  const [isImageViewOpened, setIsImageViewOpened] = useState(false);
  const onUploadSuccess = (url: string) => {
    setUploadedImage(url);
    transaction
      .submitProof(url)
      .then(() => {
        console.log('updated proof!');
        showToast({
          message:
            'Registration Approved! Your payment is being reviewed by our Admin',
          type: ToastType.success,
        });
      })
      .catch(err => {
        console.log('error updating proof', err);
        showToast({
          message: 'Failed to upload proof',
          type: ToastType.danger,
        });
      });
  };

  const onProofAccepted = () => {
    transaction
      ?.approveProof()
      .then(() => {
        transaction
          ?.approveRegistration()
          .then(() => {
            showToast({
              message: 'Payment Approved! Registration Status has changed.',
              type: ToastType.success,
            });
          })
          .catch(() => {
            showToast({
              message:
                'Payment Approved! Failed to change registration status.',
              type: ToastType.danger,
            });
          });
      })
      .catch(() => {
        showToast({
          message: 'Failed to approve payment',
          type: ToastType.danger,
        });
      });
  };

  const onProofRejected = () => {
    transaction
      ?.rejectProof()
      .then(() => {
        showToast({
          message: 'Payment Rejected!',
          type: ToastType.danger,
        });
      })
      .catch(() => {
        showToast({
          message: 'Failed to reject payment',
          type: ToastType.danger,
        });
      });
  };

  const onWithdrawalAccepted = () => {
    transaction
      ?.acceptWithdrawal()
      .then(() => {
        showToast({
          message: 'Payment status has been changed to "Withdrawn".',
          type: ToastType.success,
        });
      })
      .catch(() => {
        showToast({
          message: 'Failed to change payment status.',
          type: ToastType.danger,
        });
      });
  };

  useEffect(() => {
    if (transaction.contentCreatorId) {
      User.getById(transaction.contentCreatorId)
        .then(setContentCreator)
        .catch(err => {
          console.log('error getting content creator', err);
          setContentCreator(null);
        });
    }
  }, [transaction]);

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
                style={[
                  font.size[40],
                  font.weight.bold,
                  textColor(COLOR.text.neutral.high),
                ]}>
                Payment Proof
              </Text>
              <StatusTag
                status={transaction.payment?.status || 'Not Uploaded'}
                statusType={
                  transaction.payment?.status
                    ? paymentStatusTypeMap[transaction.payment?.status]
                    : StatusType.terminated
                }
              />
            </View>
            <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
              {/* TODO: fix copywriting */}
              {/* TODO: taro bank account admin */}
              {isBusinessPeople &&
                `You need to pay ${formatToRupiah(
                  amount,
                )} to Account Number xxxxxxxxxx [admin bank account] by [End Date regis]. Upload your payment proof here.`}

              {isAdmin && (
                <>
                  {transaction.payment?.status ===
                    PaymentStatus.proofWaitingForVerification &&
                    `Business People have paid ${formatToRupiah(
                      amount,
                    )}, please verify the payment.`}
                  {/* TODO: taro bank account CC */}
                  {transaction.payment?.status ===
                    PaymentStatus.withdrawalRequested &&
                    `Content creator have requested to withdraw their money, you need to pay ${formatToRupiah(
                      amount,
                    )} to the following bank account: ${
                      contentCreatorBankAccount?.bankName
                    } - ${contentCreatorBankAccount?.accountNumber} (${
                      contentCreatorBankAccount?.accountHolderName
                    })`}
                </>
              )}
            </Text>
          </View>

          <View style={[flex.flexCol, items.center]}>
            {uploadedImage && (
              <TouchableOpacity onPress={() => setIsImageViewOpened(true)}>
                <View
                  style={[
                    dimension.square.xlarge15,
                    rounded.medium,
                    overflow.hidden,
                  ]}>
                  <FastImage
                    style={[dimension.full]}
                    source={{uri: uploadedImage}}
                  />
                </View>
              </TouchableOpacity>
            )}
            {isBusinessPeople &&
            (transaction.payment?.status ===
              PaymentStatus.proofWaitingForVerification ||
              transaction.payment?.status === PaymentStatus.proofRejected ||
              transaction.payment?.status === undefined) ? (
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
                  onUploadSuccess={onUploadSuccess}
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
                {transaction.payment?.status ===
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
                    {/* {transaction.payment?.status === */}
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
                {transaction.payment?.status ===
                  PaymentStatus.withdrawalRequested &&
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
          // TODO: extract footer
          //   FooterComponent={({imageIndex}) => (
          //     <View style={[padding.horizontal.large, padding.bottom.xlarge2]}>
          //       <View
          //         style={[
          //           padding.default,
          //           rounded.default,
          //           {backgroundColor: 'rgba(255,255,255,0.8)'},
          //         ]}>
          //         <Text>Payment Proof</Text>
          //       </View>
          //     </View>
          //   )}
        />
      )}
    </>
  );
};

export default PaymentSheetModal;
