import {View} from 'react-native';
import {useUser} from '../../hooks/user';
import {Offer} from '../../model/Offer';
import {CustomButton} from '../atoms/Button';
import {VerticalPadding} from '../atoms/ViewPadding';
import {flex} from '../../styles/Flex';
import {COLOR} from '../../styles/Color';
import {NavigationStackProps} from '../../navigation/StackNavigation';
import {SheetModal} from '../../containers/SheetModal';

type Props = {
  isModalOpened: boolean;
  onModalDismiss: () => void;
  offer: Offer;
  openModalNegotiate: () => void;
};

const OfferActionModal = ({
  isModalOpened,
  onModalDismiss,
  offer,
  openModalNegotiate,
}: Props) => {
  const {activeRole} = useUser();

  const acceptOffer = () => {
    if (offer) {
      offer.accept().then(() => {});
    }
  };

  const declineOffer = () => {
    if (offer) {
      offer.reject().then(() => {
        navigation.goBack();
      });
    }
  };

  return (
    <SheetModal open={isModalOpened}>
      {offer?.negotiatedBy ? (
        offer?.negotiatedBy === activeRole ? (
          <CustomButton text="Negotiated" disabled />
        ) : (
          <View style={(flex.flexCol, gap.small)}>
            <CustomButton text="Accept" onPress={() => acceptOffer()} />
            <CustomButton
              type="secondary"
              text="Negotiate"
              onPress={() => openModalNegotiate()}
            />
            <CustomButton
              customBackgroundColor={{
                default: COLOR.red[60],
                disabled: COLOR.yellow[50],
              }}
              text="Reject"
              onPress={() => declineOffer()}
            />
          </View>
        )
      ) : activeRole === UserRole.ContentCreator ? (
        <View style={(flex.flexCol, gap.small)}>
          <CustomButton text="Accept" onPress={() => acceptOffer()} />
          <CustomButton
            type="secondary"
            text="Negotiate"
            onPress={() => openModalNegotiate()}
          />
          <CustomButton
            customBackgroundColor={{
              default: COLOR.red[60],
              disabled: COLOR.yellow[50],
            }}
            text="Reject"
            onPress={() => declineOffer()}
          />
        </View>
      ) : (
        <CustomButton text="Waiting for Content Creator" disabled />
      )}
    </SheetModal>
  );
};

export default OfferActionModal;
