import {View, Text} from 'react-native';
import {useUser} from '../../hooks/user';
import {Offer} from '../../model/Offer';
import {CustomButton} from '../atoms/Button';
import {HorizontalPadding} from '../atoms/ViewPadding';
import {flex, items, justify} from '../../styles/Flex';
import {COLOR} from '../../styles/Color';
import {
  AuthenticatedNavigation,
  NavigationStackProps,
} from '../../navigation/StackNavigation';
import {SheetModal} from '../../containers/SheetModal';
import {gap} from '../../styles/Gap';
import {ReactNode, useEffect, useState} from 'react';
import {Campaign} from '../../model/Campaign';
import {UserRole} from '../../model/User';
import {CustomAlert, CustomAlertProps} from './CustomAlert';
import {textColor} from '../../styles/Text';
import {font} from '../../styles/Font';
import {padding} from '../../styles/Padding';
import {showToast} from '../../helpers/toast';
import {ToastType} from '../../providers/ToastProvider';
import {ErrorMessage} from '../../constants/errorMessage';
import {currencyFormat} from '../../utils/currency';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {size} from '../../styles/Size';

type Props = {
  offer: Offer;
  isModalOpened: boolean;
  onModalDismiss: () => void;
};

const OfferActionModal = ({isModalOpened, onModalDismiss, offer}: Props) => {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <SheetModal open={isModalOpened} onDismiss={onModalDismiss}>
      <View
        style={[
          {
            paddingBottom: safeAreaInsets.bottom + size.small,
          },
        ]}>
        <OfferAction offer={offer} onSuccess={onModalDismiss} />
      </View>
    </SheetModal>
  );
};

export default OfferActionModal;

interface OfferActionProps {
  offer: Offer;
  onSuccess: () => void;
}

export const OfferAction = ({offer, onSuccess}: OfferActionProps) => {
  const {activeRole} = useUser();
  const navigation = useNavigation<NavigationStackProps>();
  const latestNegotiation = offer.getLatestNegotiation();
  const onAcceptOfferClicked = () => {
    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    // TODO: prompt buat bayar dulu, baru approve (OfferActionsModal + OfferDetailScreen)
    offer
      .accept(activeRole)
      .then(() => {
        showToast({
          type: ToastType.success,
          message: 'Offer accepted',
        });
        onSuccess();
      })
      .catch(() => {
        showToast({
          type: ToastType.danger,
          message: ErrorMessage.GENERAL,
        });
      });
  };

  const onRejectOfferClicked = () => {
    if (!activeRole) {
      showToast({
        type: ToastType.info,
        message: ErrorMessage.GENERAL,
      });
      return;
    }
    offer
      .reject(activeRole)
      .then(() => {
        showToast({
          type: ToastType.info,
          message: 'Offer rejected',
        });
        onSuccess();
      })
      .catch(() => {
        showToast({
          type: ToastType.danger,
          message: ErrorMessage.GENERAL,
        });
      });
  };

  const openModalNegotiate = () => {
    onSuccess();
    if (!offer) {
      return;
    }
    navigation.navigate(AuthenticatedNavigation.NegotiateModal, {
      offer: offer,
    });
  };

  if (latestNegotiation?.negotiatedBy === activeRole) {
    return null;
  }

  return (
    <View style={[flex.flexCol, gap.default, padding.horizontal.default]}>
      <OfferAlert
        offer={offer}
        title={
          <Text style={[font.size[30], textColor(COLOR.text.neutral.high)]}>
            Are you sure you want to accept this offer?
          </Text>
        }
        triggerAlertButtonText="Accept"
        approveButtonText="Accept"
        onApprove={onAcceptOfferClicked}
      />
      <CustomButton
        type="secondary"
        text="Negotiate"
        onPress={openModalNegotiate}
      />
      <OfferAlert
        offer={offer}
        title={
          <Text style={[textColor(COLOR.text.neutral.high), font.size[30]]}>
            Are you sure you want to reject this offer?
          </Text>
        }
        customBackgroundColor={{
          default: COLOR.red[60],
          disabled: COLOR.yellow[50],
        }}
        triggerAlertButtonText="Reject"
        approveButtonText="Reject"
        onApprove={onRejectOfferClicked}
      />
    </View>
  );
};

interface OfferAlertProps extends Partial<CustomAlertProps> {
  offer: Offer;
  title: ReactNode;
  triggerAlertButtonText: string;
  onApprove: () => void;
}

const OfferAlert = ({
  offer,
  title,
  triggerAlertButtonText,
  ...props
}: OfferAlertProps) => {
  const latestNegotiation = offer.getLatestNegotiation();
  return (
    <CustomAlert
      {...props}
      confirmationText={
        <View>
          {title}
          <View
            style={[
              flex.flexRow,
              justify.between,
              items.center,
              padding.top.xsmall,
            ]}>
            <Text
              style={[
                textColor(COLOR.text.neutral.high),
                font.weight.bold,
                font.size[30],
              ]}>
              Offered Fee
            </Text>
            <Text
              style={[
                textColor(COLOR.text.neutral.high),
                font.weight.bold,
                font.size[30],
              ]}>
              {currencyFormat(latestNegotiation?.fee || 0)}
            </Text>
          </View>
        </View>
      }
      text={triggerAlertButtonText}
      approveButtonText="Accept"
    />
  );
};
