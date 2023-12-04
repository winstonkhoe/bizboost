import {Text, View} from 'react-native';
import {SheetModal} from '../../containers/SheetModal';
import {flex, items, justify} from '../../styles/Flex';
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
import {UserRole} from '../../model/User';
import {BasicStatus, basicStatusTypeMap} from '../../model/Transaction';
import StatusTag, {StatusType} from '../atoms/StatusTag';

type Props = {
  isModalOpened: boolean;
  onModalDismiss: () => void;
  amount: number;
  onProofUploaded: (url: string) => void;
  defaultImage?: string;
  onProofAccepted?: () => void;
  onProofRejected?: () => void;
  paymentStatus?: BasicStatus;
};

const PaymentSheetModal = ({
  isModalOpened,
  onModalDismiss,
  amount,
  onProofUploaded,
  defaultImage = undefined,
  onProofAccepted = undefined,
  onProofRejected = undefined,
  paymentStatus,
}: Props) => {
  const {activeRole} = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | undefined>();
  const [isImageViewOpened, setIsImageViewOpened] = useState(false);

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
          <View style={[flex.flexCol, items.center, gap.default]}>
            <View
              style={[flex.flexRow, items.center, justify.between]}
              className="w-full">
              <Text
                className="font-bold"
                style={[font.size[40], textColor(COLOR.text.neutral.high)]}>
                Payment Proof
              </Text>
              <StatusTag
                status={paymentStatus || 'Not Uploaded'}
                statusType={
                  paymentStatus
                    ? basicStatusTypeMap[paymentStatus]
                    : StatusType.terminated
                }
              />
            </View>
            {activeRole === UserRole.BusinessPeople && (
              <Text style={[font.size[20], textColor(COLOR.text.neutral.med)]}>
                {/* TODO: fix copywriting */}
                {`You need to pay ${formatToRupiah(
                  amount,
                )} to }Account Number xxxxxxxxxx by [End Date regis]. Upload your payment proof here.`}
              </Text>
            )}
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
            {activeRole === UserRole.BusinessPeople ? (
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
                      padding.top.default,
                      textColor(COLOR.text.green.default),
                      font.size[30],
                    ]}>
                    Reupload
                  </Text>
                ) : (
                  <View
                    className="border-dashed border"
                    style={[
                      dimension.square.xlarge12,
                      rounded.medium,
                      flex.flexRow,
                      justify.center,
                      items.center,
                    ]}>
                    <PhotosIcon width={30} height={30} />
                  </View>
                )}
              </MediaUploader>
            ) : (
              <View style={[flex.flexRow, gap.default, padding.top.default]}>
                {paymentStatus === BasicStatus.pending && (
                  <>
                    <View style={[flex.flex1]}>
                      <CustomButton
                        text="Reject"
                        scale={1}
                        onPress={onProofRejected}
                        customTextSize={font.size[20]}
                        type="alternate"
                      />
                    </View>
                    <View style={[flex.flex1]}>
                      <CustomButton
                        text="Accept"
                        scale={1}
                        onPress={onProofAccepted}
                        customTextSize={font.size[20]}
                      />
                    </View>
                  </>
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
